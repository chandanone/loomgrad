"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, Loader2, X } from "lucide-react";
import { bulkUploadChallenges } from "@/actions/bulkUploads";

export function BulkUploadExcel({ categoryId }: { categoryId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [maxSize, setMaxSize] = useState(5); // in MB
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDownloadFormat = () => {
        // Create a dummy CSV format and trigger download
        const headers = [
            "Title", "Description", "Challenge Type", "Question Type", "Difficulty", "Language",
            "Starter Code", "Solution", "Hint", "Correct Answer",
            "Option A", "Is Option A Correct", "Option B", "Is Option B Correct",
            "Option C", "Is Option C Correct", "Option D", "Is Option D Correct",
            "Test Input 1", "Test Output 1", "Test Input 2", "Test Output 2", "Test Input 3", "Test Output 3"
        ];

        const row1 = [
            "Example Challenge", "Solve this problem...", "CODING", "CODING", "1", "JavaScript",
            "function solve() {}", "function solve() { return true; }", "Think about recursion", "",
            "", "", "", "", "", "", "", "",
            "1, 2", "3", "3, 4", "7", "", ""
        ];

        const row2 = [
            "Math Question", "What is 2+2?", "MATH", "MCQ_SINGLE", "1", "JavaScript",
            "", "4 is the exact answer.", "", "",
            "3", "FALSE", "4", "TRUE", "5", "FALSE", "6", "FALSE",
            "", "", "", "", "", ""
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + row1.map(v => `"${v}"`).join(",") + "\n"
            + row2.map(v => `"${v}"`).join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bulk_challenge_upload_format.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!file) return;

        // Check file size limit
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File exceeds the selected limit of ${maxSize}MB.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("maxSize", maxSize.toString());

            const res = await bulkUploadChallenges(categoryId, formData);
            if (res?.success) {
                setIsOpen(false);
                setFile(null);
                window.location.reload(); // Refresh to see new problems
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while uploading. Please check the file format.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
            >
                <FileSpreadsheet className="w-4 h-4" /> Bulk Upload Excel
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-emerald-600" /> Bulk Upload Challenges
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-zinc-50/50">
                    <div>
                        <button
                            onClick={handleDownloadFormat}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 w-full justify-center"
                        >
                            <Download className="w-4 h-4" /> Download Dummy Format Template
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-sm font-bold text-zinc-700">Max File Size Limit</label>
                            <select
                                value={maxSize}
                                onChange={(e) => setMaxSize(Number(e.target.value))}
                                className="border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-bold bg-white focus:outline-none focus:border-blue-500"
                            >
                                <option value={5}>5 MB</option>
                                <option value={10}>10 MB</option>
                            </select>
                        </div>

                        <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-8 bg-white text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                            <input
                                type="file"
                                id="excel-upload"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 mb-1">{file ? file.name : "Click to select Excel/CSV file"}</p>
                                    <p className="text-xs text-zinc-500 font-medium">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports .xlsx, .xls, .csv"}</p>
                                </div>
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 flex gap-3 bg-white">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Upload Problems'}
                    </button>
                </div>
            </div>
        </div>
    );
}
