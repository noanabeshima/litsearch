import {useState} from 'react'
import './SearchBar.css'

    

export default function SearchBar() {
    const [inputText, setInputText] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        console.log(inputText)
        window.location.href = '/search?q=' + inputText
        setInputText('')
        
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="searchBox">
                <input className="searchBarInput" type="text" placeholder="Search for a keyword" value={inputText} onChange={e => setInputText(e.target.value)} />
                <button className="searchButton" type="submit">Search</button>
            </div>
        </form>
    )

}