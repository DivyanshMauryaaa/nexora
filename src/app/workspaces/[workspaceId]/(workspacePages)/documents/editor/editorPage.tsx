import TiptapEditor from "./(tiptap)/editorEngine";

const DocumentPage = ({ documentName, documentType, documentValue }: { documentName?: string; documentType?: string, documentValue: any }) => {
    return (
        <div>
            <p className="text-3xl md:text-[40px] text-center font-[600]">{documentName || "File"}.{documentType || "note"}</p>
            
            <div className="p-4 ">
                <TiptapEditor documentValue={documentValue} />
            </div>
        </div>
    )

}

export default DocumentPage;