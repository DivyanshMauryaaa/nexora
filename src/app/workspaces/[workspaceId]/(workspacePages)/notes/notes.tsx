const Notes = () => {
    return(
        <div>
            <p className="font-bold text-3xl">Quick Notes</p>
            <br />

            <button 
            className="py-2 px-5 text-md hover:bg-blue-800 hover:text-white border border-gray-300 cursor-pointer transition-all duration-200 text-gray-500 hover:border-blue-800 rounded-lg">New Note</button>
        </div>
    )
}

export default Notes;