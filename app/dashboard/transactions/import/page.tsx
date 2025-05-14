"use client";

import { useState } from "react";
import { CSVUploader } from "@/components/transactions/CSVUploader";
import { ImportPreviewModal } from "@/components/transactions/ImportPreviewModal";
import { ImportErrorDisplay } from "@/components/transactions/ImportErrorDisplay";
import { ImportSuccessSummary } from "@/components/transactions/ImportSuccessSummary";
import { useTransactionImport } from "@/app/hooks/useTransactionImport";
import { TransactionImportDTO } from "@/domains/Transactions/TransactionImportDTO";
import { Button } from "@/components/ui/button";
import { ArrowUp, FileSpreadsheet, RefreshCw } from "lucide-react";

export default function ImportTransactionsPage() {
  const {
    state,
    handleFileSelect,
    handleFileRemove,
    uploadForPreview,
    confirmImport,
    reset
  } = useTransactionImport();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Handle upload button click
  const handleUpload = async () => {
    await uploadForPreview();
    setPreviewModalOpen(true);
  };

  // Handle import confirmation from modal
  const handleConfirmImport = (selectedTransactions: TransactionImportDTO[]) => {
    setPreviewModalOpen(false);
    confirmImport(selectedTransactions);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewModalOpen(false);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Transactions</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import your transactions
          </p>
        </div>
      </div>

      {/* Error display */}
      {state.step === 'error' && (
        <ImportErrorDisplay 
          errors={state.errors} 
          className="mb-6" 
        />
      )}

      {/* Main content based on current step */}
      {state.step === 'success' && state.result ? (
        <ImportSuccessSummary 
          result={state.result} 
          onReset={reset} 
        />
      ) : (
        <div className="grid gap-6">
          {/* Upload section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-medium mb-4">
              Upload CSV File
            </h2>
            
            <CSVUploader
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              isUploading={state.step === 'uploading'}
            />

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={!state.file || state.step === 'uploading'}
                className="flex items-center"
              >
                {state.step === 'uploading' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Preview Transactions
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-medium mb-4">
              <FileSpreadsheet className="h-5 w-5 inline-block mr-2" />
              CSV Format Guidelines
            </h2>
            <div className="space-y-4 text-sm">
              <p>
                Your CSV file should include the following columns:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>date</strong>: Transaction date (YYYY-MM-DD)</li>
                <li><strong>name</strong>: Transaction description</li>
                <li><strong>amount</strong>: Transaction amount (positive for income, negative for expenses)</li>
                <li><strong>categoryId</strong>: Category ID (optional)</li>
                <li><strong>notes</strong>: Additional notes (optional)</li>
                <li><strong>type</strong>: INCOME or EXPENSE (optional, will be determined by amount if not provided)</li>
              </ul>
              <p className="text-muted-foreground">
                The first row of your CSV should contain the column headers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <ImportPreviewModal
        isOpen={previewModalOpen && state.step === 'preview'}
        onClose={handleClosePreview}
        transactions={state.transactions}
        errors={state.errors}
        isLoading={state.step === 'importing'}
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
} 