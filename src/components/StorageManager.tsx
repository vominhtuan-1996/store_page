import { useState, useEffect, useCallback, useRef } from 'react';
import { ToolHeader } from './ui/HubButton';
import { supabase } from '../services/supabase';

interface StorageManagerProps {
  onBack: () => void;
}

interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
  };
}

interface Bucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

export const StorageManager = ({ onBack }: StorageManagerProps) => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [isManualBucket, setIsManualBucket] = useState(false);
  const [manualBucketName, setManualBucketName] = useState('');
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbStatus, setDbStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkConnection = async () => {
    setDbStatus('checking');
    try {
      // Test by querying the 'tasks' table which the user says is working
      const { error } = await supabase.from('tasks').select('id').limit(1);
      if (error) {
        console.error('Connection check error:', error);
        setDbStatus('error');
      } else {
        setDbStatus('ok');
      }
    } catch (err) {
      setDbStatus('error');
    }
  };

  const fetchBuckets = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.error('List buckets error:', error);
        setError(`Lỗi liệt kê bucket: ${error.message}. Nếu bạn đã biết tên bucket, hãy nhập thủ công.`);
        setIsManualBucket(true);
      } else if (data && data.length > 0) {
        setBuckets(data);
        if (!selectedBucket) setSelectedBucket(data[0].name);
      } else {
        setError('Không tự động tìm thấy bucket nào. Hãy nhập tên bucket thủ công.');
        setIsManualBucket(true);
      }
    } catch (err: any) {
      setError(`Lỗi hệ thống: ${err.message}`);
    }
    setLoading(false);
  };

  const fetchFiles = useCallback(async (bucketName: string) => {
    if (!bucketName) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.storage.from(bucketName).list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      setError(`Lỗi khi lấy danh sách file: ${error.message}`);
    } else if (data) {
      // Filter out folders (objects without metadata/id are often folders in Supabase auto-list)
      setFiles(data as unknown as FileObject[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedBucket = localStorage.getItem('supabase_last_bucket');
    if (savedBucket) {
      setSelectedBucket(savedBucket);
      setManualBucketName(savedBucket);
    }
    fetchBuckets();
    checkConnection();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      localStorage.setItem('supabase_last_bucket', selectedBucket);
      fetchFiles(selectedBucket);
    }
  }, [selectedBucket, fetchFiles]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBucket) return;

    setUploading(true);
    setError(null);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(selectedBucket)
      .upload(filePath, file);

    if (uploadError) {
      setError(`Upload thất bại: ${uploadError.message}`);
    } else {
      fetchFiles(selectedBucket);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = async (fileName: string) => {
    if (!selectedBucket) return;
    
    const { data, error } = await supabase.storage
      .from(selectedBucket)
      .createSignedUrl(fileName, 60); // URL valid for 60 seconds

    if (error) {
      setError(`Không thể tạo link download: ${error.message}`);
    } else if (data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!selectedBucket || !window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;

    const { error } = await supabase.storage
      .from(selectedBucket)
      .remove([fileName]);

    if (error) {
      setError(`Xóa thất bại: ${error.message}`);
    } else {
      fetchFiles(selectedBucket);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return '🖼️';
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦';
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return '🎥';
    return '📁';
  };

  return (
    <div className="flex h-full w-full flex-col">
      <ToolHeader
        title="Storage Manager"
        subtitle="Quản lý file trên Supabase Storage"
        accent="#2DD4BF"
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col overflow-auto px-10 py-8">
      {/* Bucket + Upload controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">

        <div className="flex items-center gap-2">
          {isManualBucket || buckets.length === 0 ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Nhập tên bucket..."
                value={manualBucketName}
                onChange={(e) => setManualBucketName(e.target.value)}
                className="rounded-xl border-none bg-white/5 px-3 py-2 text-xs font-medium text-white outline-none ring-1 ring-white/10 focus:ring-accent-cyan/50 h-9"
              />
              <button
                onClick={() => {
                  if (manualBucketName.trim()) {
                    setSelectedBucket(manualBucketName.trim());
                    setIsManualBucket(false);
                    // Trigger a refresh
                    fetchFiles(manualBucketName.trim());
                  }
                }}
                className="rounded-lg bg-accent-cyan/20 px-3 py-2 text-xs font-bold text-accent-cyan hover:bg-accent-cyan/30 h-9"
              >
                Kết nối
              </button>
              {buckets.length > 0 && (
                <button
                  onClick={() => setIsManualBucket(false)}
                  className="rounded-lg bg-white/5 p-2 text-slate-500 hover:text-white h-9 w-9 flex items-center justify-center underline text-[10px]"
                >
                  Hủy
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="rounded-xl border-none bg-white/5 px-3 py-2 text-xs font-medium text-white outline-none ring-1 ring-white/10 focus:ring-accent-cyan/50 h-9"
              >
                {buckets.map(b => (
                  <option key={b.id} value={b.name} className="bg-slate-900">{b.name}</option>
                ))}
              </select>
              <button
                onClick={() => setIsManualBucket(true)}
                className="rounded-lg bg-white/5 p-2 text-slate-500 hover:text-white h-9 w-9 flex items-center justify-center"
                title="Nhập tên bucket thủ công"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !selectedBucket}
            className="flex items-center gap-1.5 rounded-xl bg-accent-cyan/20 px-3 py-2 text-xs font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/30 disabled:opacity-40"
          >
            {uploading ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Lỗi
          </p>
          <p className="opacity-90">{error}</p>
          <div className="mt-2 text-[11px] opacity-70 border-t border-red-500/20 pt-2">
            Trạng thái kết nối DB: {
              dbStatus === 'checking' ? 'Đang kiểm tra...' :
              dbStatus === 'ok' ? '✅ Database hoạt động' :
              dbStatus === 'error' ? '❌ Database lỗi (kiểm tra Key)' : 'Chưa kiểm tra'
            }
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm file..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/10 focus:ring-accent-cyan/50"
        />
      </div>

      {/* File List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-600">
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang tải file...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-600">
            {searchQuery ? 'Không tìm thấy file nào khớp.' : 'Bucket này chưa có file.'}
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.id || file.name} className="glass flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5 transition-all hover:bg-white/[0.04]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">
                {getFileIcon(file.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white" title={file.name}>
                  {file.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span>{formatSize(file.metadata?.size || 0)}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                  <span>{new Date(file.created_at).toLocaleDateString('vi-VN')}</span>
                  {file.metadata?.mimetype && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                      <span className="truncate max-w-[80px] sm:max-w-none">{file.metadata.mimetype}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(file.name)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-accent-cyan"
                  title="Tải xuống"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7.5L12 12m0 0l4.5-4.5M12 12V3" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                  title="Xóa"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};
