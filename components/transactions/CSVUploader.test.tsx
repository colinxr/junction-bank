import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CSVUploader } from './CSVUploader';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  UploadCloud: () => <div data-testid="upload-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('CSVUploader', () => {
  const onFileSelectMock = vi.fn();
  const onFileRemoveMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders upload area when no file is selected', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} />);
    
    expect(screen.getByText('Drop your CSV file here, or click to browse')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });
  
  it('accepts a valid CSV file', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} />);
    
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(onFileSelectMock).toHaveBeenCalledWith(file);
  });
  
  it('displays an error for non-CSV files', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('Please upload a CSV file')).toBeInTheDocument();
    expect(onFileSelectMock).not.toHaveBeenCalled();
  });
  
  it('displays an error for files exceeding size limit', () => {
    const maxSizeInMB = 0.00001; // Very small to trigger error
    render(<CSVUploader onFileSelect={onFileSelectMock} maxSizeInMB={maxSizeInMB} />);
    
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(`File is too large. Maximum size is ${maxSizeInMB}MB`)).toBeInTheDocument();
    expect(onFileSelectMock).not.toHaveBeenCalled();
  });
  
  it('displays file details after file is selected', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} />);
    
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('test.csv')).toBeInTheDocument();
    expect(screen.getByTestId('file-icon')).toBeInTheDocument();
  });
  
  it('allows removing the selected file', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} onFileRemove={onFileRemoveMock} />);
    
    // First select a file
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Then click the remove button
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    expect(onFileRemoveMock).toHaveBeenCalled();
    // Should show upload area again
    expect(screen.getByText('Drop your CSV file here, or click to browse')).toBeInTheDocument();
  });
  
  it('shows uploading state when isUploading is true', () => {
    render(<CSVUploader onFileSelect={onFileSelectMock} isUploading={true} />);
    
    // First select a file
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/file/i, { selector: 'input[type="file"]' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show check icon instead of remove button
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });
});

// Add jest DOM matchers for testing-library
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
} 