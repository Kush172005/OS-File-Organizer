import FileCard from './FileCard';

function FileGrid({ files, onDelete, onMove, deletingFile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file, idx) => (
        <div key={file.name} className="animate-slideUp" style={{ animationDelay: `${idx * 30}ms` }}>
          <FileCard
            file={file}
            onDelete={onDelete}
            onMove={onMove}
            deletingFile={deletingFile}
          />
        </div>
      ))}
    </div>
  );
}

export default FileGrid;
