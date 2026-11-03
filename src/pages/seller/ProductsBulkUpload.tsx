import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { bulkCreateProducts, uploadImage, type BulkUploadRow } from '../../lib/api';
import toast from 'react-hot-toast';

type ParsedRow = BulkUploadRow & { _rowNum: number };
type RowError = { row: number; error: string };

export function ProductsBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    summary: {
      rowsReceived: number;
      rowsValid: number;
      rowsFailed: number;
      productsCreated: number;
      variantsCreated: number;
    };
    errors: RowError[];
  } | null>(null);

  // Image mapping state: productName -> imageUrl
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [uploadingProduct, setUploadingProduct] = useState<string | null>(null);

  // ---------- CSV Parsing ----------

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  };

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setParsedRows([]);
    setParseErrors([]);
    setImportResult(null);
    setProductImages({});

    try {
      const text = await selectedFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (lines.length < 2) {
        setParseErrors(['CSV is empty or has no data rows.']);
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const requiredHeaders = [
        'name',
        'baseprice',
        'sku',
        'price',
        'stock',
      ];

      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setParseErrors([
          `Missing required columns: ${missingHeaders.join(', ')}`,
        ]);
        return;
      }

      const headerIndex = (name: string) => headers.indexOf(name);

      const rows: ParsedRow[] = [];
      const errs: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowNum = i;
        const cells = parseCsvLine(lines[i]);

        const get = (key: string) => {
          const idx = headerIndex(key);
          return idx >= 0 ? (cells[idx] ?? '').trim() : '';
        };

        const name = get('name');
        const sku = get('sku');
        const basePriceStr = get('baseprice');
        const priceStr = get('price');
        const stockStr = get('stock');

        if (!name) {
          errs.push(`Row ${rowNum}: missing "name"`);
          continue;
        }
        if (!sku) {
          errs.push(`Row ${rowNum}: missing "sku"`);
          continue;
        }
        const basePrice = Number(basePriceStr);
        const price = Number(priceStr);
        const stock = Number(stockStr);

        if (isNaN(basePrice) || basePrice < 0) {
          errs.push(`Row ${rowNum}: invalid "basePrice" (${basePriceStr})`);
          continue;
        }
        if (isNaN(price) || price < 0) {
          errs.push(`Row ${rowNum}: invalid "price" (${priceStr})`);
          continue;
        }
        if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
          errs.push(`Row ${rowNum}: invalid "stock" (${stockStr})`);
          continue;
        }

        rows.push({
          _rowNum: rowNum,
          name,
          description: get('description') || undefined,
          basePrice,
          category: get('category') || undefined,
          sku,
          size: get('size') || undefined,
          color: get('color') || undefined,
          price,
          stock,
          // We will override this with the uploaded image below
          imageUrl: get('imageurl') || undefined, 
        });
      }

      setParsedRows(rows);
      setParseErrors(errs);
    } catch {
      setParseErrors(['Could not read the file. Please upload a valid CSV.']);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedRows([]);
    setParseErrors([]);
    setImportResult(null);
    setProductImages({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- Image Upload per Product ----------

  const handleImageUpload = async (productName: string, files: FileList) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select image files');
      return;
    }

    setUploadingProduct(productName);
    const newUrls: string[] = [];

    for (const file of validFiles) {
      const res = await uploadImage(file, 'products');
      if (res.ok && res.url) {
        newUrls.push(res.url);
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploadingProduct(null);

    setProductImages(prev => ({ 
      ...prev, 
      [productName]: [...(prev[productName] || []), ...newUrls] 
    }));
    toast.success(`Added ${newUrls.length} image(s) for "${productName}"`);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);

    // Merge the uploaded images into the rows
    const rowsForApi: BulkUploadRow[] = parsedRows.map((r) => ({
      name: r.name,
      description: r.description,
      basePrice: r.basePrice,
      category: r.category,
      sku: r.sku,
      size: r.size,
      color: r.color,
      price: r.price,
      stock: r.stock,
      images: productImages[r.name] || [],
    }));

    const result = await bulkCreateProducts(rowsForApi);
    setImporting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setImportResult({
      summary: result.summary,
      errors: result.errors,
    });
    toast.success(
      `Imported ${result.summary.productsCreated} product(s) successfully`
    );
  };

  // Get unique product names so we can show the upload list
  const uniqueProducts = Array.from(new Set(parsedRows.map((r) => r.name)));
  const uniqueProductsCount = uniqueProducts.length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/seller/products')}
          className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Bulk Upload Products</h1>
          <p className="text-surface-500 mt-0.5">
            Add many products at once by uploading a CSV file
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-2">How it works</p>
            <ol className="space-y-1 list-decimal list-inside text-blue-800">
              <li>Download the template CSV file below</li>
              <li>Fill in your products. <strong>One row = one variant.</strong></li>
              <li>Save the file as CSV</li>
              <li>Upload the CSV here</li>
              <li><strong>Upload images for each product</strong> in the list that appears</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="flex items-center gap-3 mb-6">
        <a href="/products-template.csv" download="products-template.csv">
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>
            Download Template
          </Button>
        </a>
      </div>

      {/* Upload area */}
      {!file ? (
        <div
          className="border-2 border-dashed border-surface-300 rounded-xl p-12 text-center hover:border-primary-400 hover:bg-surface-50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <p className="text-base font-medium text-surface-900 mb-1">
            Drop your CSV file here
          </p>
          <p className="text-sm text-surface-500">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          {/* File info */}
          <div className="flex items-center justify-between p-4 border-b border-surface-100 bg-surface-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-surface-900">{file.name}</p>
                <p className="text-xs text-surface-500">
                  {parsedRows.length} valid row{parsedRows.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Some rows had issues:</p>
                  <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload for Unique Products */}
          {uniqueProducts.length > 0 && (
            <div className="p-4 border-b border-surface-100 bg-white">
              <h3 className="text-sm font-bold text-surface-900 mb-3">Upload Images</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uniqueProducts.map((productName) => {
  const images = productImages[productName] || [];
  return (
    <div key={productName} className="border border-surface-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-surface-900 truncate">{productName}</p>
        <span className="text-xs text-surface-400">{images.length} image(s)</span>
      </div>
      
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, idx) => (
            <div key={idx} className="relative w-12 h-12">
              <img src={url} alt="preview" className="w-full h-full object-cover rounded border border-surface-200" />
              <button
                type="button"
                onClick={() => {
                  setProductImages(prev => ({
                    ...prev,
                    [productName]: prev[productName].filter((_, i) => i !== idx)
                  }));
                }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center justify-center w-full py-2 border-2 border-dashed border-surface-300 rounded-lg cursor-pointer hover:bg-surface-50 transition-colors">
        <ImageIcon className="w-4 h-4 text-surface-500 mr-2" />
        <span className="text-sm text-surface-600">
          {uploadingProduct === productName ? 'Uploading...' : 'Add Images'}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleImageUpload(productName, e.target.files);
          }}
        />
      </label>
    </div>
  );
})}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between p-4 bg-surface-50">
            <p className="text-xs text-surface-500">
              This will create{' '}
              <span className="font-semibold text-surface-900">
                {uniqueProductsCount} product{uniqueProductsCount === 1 ? '' : 's'}
              </span>{' '}
              with{' '}
              <span className="font-semibold text-surface-900">
                {parsedRows.length} variant{parsedRows.length === 1 ? '' : 's'}
              </span>
            </p>
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={parsedRows.length === 0 || importResult !== null}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Import {parsedRows.length} Row{parsedRows.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className="mt-6 bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="flex items-center gap-3 p-4 bg-green-50 border-b border-green-200">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-bold text-green-900">Import complete</h2>
          </div>

          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Products created" value={importResult.summary.productsCreated} />
              <Stat label="Variants created" value={importResult.summary.variantsCreated} />
              <Stat label="Rows valid" value={importResult.summary.rowsValid} />
              <Stat
                label="Rows failed"
                value={importResult.summary.rowsFailed}
                danger={importResult.summary.rowsFailed > 0}
              />
            </div>

            {importResult.errors.length > 0 && (
              <div className="pt-3 border-t border-surface-100">
                <p className="text-sm font-medium text-red-900 mb-2">Errors:</p>
                <ul className="space-y-1 text-xs text-red-700 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>
                      • Row {err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <Button onClick={() => navigate('/seller/products')}>
                Back to Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="bg-surface-50 rounded-lg p-3 border border-surface-100">
      <p className={`text-2xl font-bold ${danger ? 'text-red-600' : 'text-surface-900'}`}>
        {value}
      </p>
      <p className="text-xs text-surface-500 mt-0.5">{label}</p>
    </div>
  );
}