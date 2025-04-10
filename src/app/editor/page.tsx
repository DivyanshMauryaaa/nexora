import TiptapEditor from "./(tiptap)/page";

const page = ({ documentName, documentType }: { documentName?: string; documentType?: string }) => {
    return (
        <div>
            <p className="text-3xl md:text-[40px] text-center font-[600]">{documentName || "File"}.{documentType || "note"}</p>
            
            <div className="p-4 ">
                <TiptapEditor />
            </div>
        </div>
    )

}

export default page;