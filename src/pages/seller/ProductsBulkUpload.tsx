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
} from 'lucide-react';
import { Button } from '../../components/ui';
import { bulkCreateProducts, type BulkUploadRow } from '../../lib/api';
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);

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
      imageUrl: r.imageUrl,
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

  // ---------- Preview: group rows for display ----------

  const uniqueProducts = new Set(parsedRows.map((r) => r.name.toLowerCase())).size;

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
              <li>Open it in Excel, Google Sheets, or Numbers</li>
              <li>
                Fill in your products. <strong>One row = one variant.</strong> If a product has
                3 sizes, add 3 rows with the same product name.
              </li>
              <li>Save the file as CSV</li>
              <li>Upload it here</li>
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
                  {parseErrors.length > 0 && ` · ${parseErrors.length} parse error(s)`}
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
                  <p className="font-medium mb-1">
                    Some rows had issues and won't be imported:
                  </p>
                  <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview table */}
          {parsedRows.length > 0 && (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 sticky top-0">
                  <tr className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider border-b border-surface-200">
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Variant</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-50">
                      <td className="px-3 py-2 text-xs text-surface-400">
                        {row._rowNum}
                      </td>
                      <td className="px-3 py-2 text-surface-900 font-medium truncate max-w-[180px]">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-surface-600">
                        {row.category ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-xs text-surface-600 font-mono">
                        {row.sku}
                      </td>
                      <td className="px-3 py-2 text-surface-600">
                        {[row.size, row.color].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-surface-900">
                        ₹{row.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right text-surface-600">
                        {row.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-surface-100 bg-surface-50">
            <p className="text-xs text-surface-500">
              This will create{' '}
              <span className="font-semibold text-surface-900">
                {uniqueProducts} product{uniqueProducts === 1 ? '' : 's'}
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