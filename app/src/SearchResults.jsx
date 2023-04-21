import {useState, useEffect} from 'react'
import './SearchResults.css'
import SearchBar from './SearchBar'


function TopRow({sortBy, colToSortBy, sortOrder}) {

    function ColumnHeader({colIdx, colKey, colName, sortBy, sortOrder, colToSortBy=''}) {
        var extraText = ' ▲'
        if (colKey === colToSortBy) {
            if (sortOrder !== 'ascending') {
                extraText = ' ▼'
            }
        }
        function handleClick() {
            sortBy(colKey)
        }
    
        const extraTextVisibility = colKey === colToSortBy ? 'visible' : 'hidden'
    
        return (
            <div className='resultItem odd columnHeader' onClick={handleClick} style={{'gridRowStart': 1, 'gridColumnStart': colIdx, 'fontWeight': 800}}>{colName}<span style={{visibility: extraTextVisibility}}>{extraText}</span></div>
        )
    }

    return (
        <>
            <ColumnHeader colIdx={1} colKey='title' colName='Title' {...{sortBy, colToSortBy, sortOrder}}/>
            <ColumnHeader colIdx={2} colKey='year' colName='By' {...{sortBy, colToSortBy, sortOrder}}/>
            <ColumnHeader colIdx={3} colKey='citationCount' colName='Cites' {...{sortBy, colToSortBy, sortOrder}}/>
            <ColumnHeader colIdx={4} colKey='referenceCount' colName='Refs' {...{sortBy, colToSortBy, sortOrder}}/>
            <ColumnHeader colIdx={5} colKey='directUrl' colName='URL' {...{sortBy, colToSortBy, sortOrder}}/>
        </>
    )
}

function Result({result, index}) {
    const resultClassName = 'resultItem ' + (index % 2 == 0 ? 'even' : 'odd')
    if (!result['directUrl']) {
        result['directUrl'] = result['url']
    }

    function handleCitationClick(e) {
        if (result['citationCount'] !== 0) {
            window.location.href = `/citations?title=${result['title']}&authorString=${result['authorString']}&paperId=${result['paperId']}&directUrl=${result['directUrl']}`
        }
    }

    function handleRefClick(e) {
        if (result['referenceCount'] !== 0) {
            window.location.href = `/references?title=${result['title']}&authorString=${result['authorString']}&paperId=${result['paperId']}&directUrl=${result['directUrl']}`
        }

    }
    return (
        <>
            <div className={resultClassName} style={{'gridRowStart': index + 2, 'gridColumnStart': 1}}>
                <div className='authorCol'><a href={result['url']} target="_blank">{result['title']}</a></div>
            </div>
            <div className={resultClassName} style={{'gridRowStart': index + 2, 'gridColumnStart': 2}}>{result['authorString']}</div>
            <div className={resultClassName} style={{'gridRowStart': index + 2, 'gridColumnStart': 3}}><span className="citationCount" onClick={handleCitationClick}>{result['citationCount']}</span></div>
            <div className={resultClassName} style={{'gridRowStart': index + 2, 'gridColumnStart': 4}}><span className="referenceCount" onClick={handleRefClick}>{result['referenceCount']}</span></div>
            <div className={resultClassName} style={{'gridRowStart': index + 2, 'gridColumnStart': 5}}><a href={result['directUrl']} target="_blank">{result['urlSite']}</a></div>
            
        </>
    )
}


function processPaper(paper) {

    function getLastName(name) {
        const splitName = name.split(' ')
        return splitName[splitName.length - 1]
    }
    
    function getAuthorString(paper) {
        const authors = paper['authors']
        const year = paper['year'] ? paper['year'] : ''
        if (authors.length == 0) {
            return year
        }
        else if (authors.length == 1) {
            return getLastName(authors[0]['name']) + ' ' + year
        } else {
            return getLastName(authors[0]['name']) + ' et al.' + ' ' + year
        }
    }

    paper['authorString'] = getAuthorString(paper)
    if (!paper['citationCount']) {
        paper['citationCount'] = 0
    }
    if (!paper['referenceCount']) {
        paper['referenceCount'] = 0
    }
    paper['urlSite'] = 'Scholar'
    
    if (!paper['externalIds']) {
        paper['externalIds'] = {}
    }

    if ('DOI' in paper['externalIds']) {
        const doi = paper['externalIds']['DOI']
        // check if doi is a url
        if (doi.slice(0, 4) === 'http') {
            paper['directUrl'] = doi
            paper['urlSite'] = 'Unknown'
        } else {
            paper['directUrl'] = 'https://sci-hub.se/' + doi
            paper['urlSite'] = 'SciHub'
        }
    }
    if (paper['externalIds']['ACL']) {
        paper['directUrl'] = 'https://aclanthology.org/' + paper['externalIds']['ACL'] + '.pdf'
        paper['urlSite'] = 'ACL'
    }
    if (paper['externalIds']['ArXiv']) {
        paper['directUrl'] = 'https://arxiv.org/pdf/'+paper['externalIds']['ArXiv']+'.pdf'
        paper['urlSite'] = 'ArXiv'
    }
    if (paper['externalIds']['PubMedCentral']) {
        paper['directUrl'] = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC' + paper['externalIds']['PubMedCentral']
        paper['urlSite'] = 'PubMed'
    }

    return paper
}

function SearchResults({results, setResults}) {
    const [colToSortBy, setColToSortBy] = useState('')
    const [sortOrder, setSortOrder] = useState('')

    function toggleSortBy(colKey) {
        if (colKey === colToSortBy) {
            const newSortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending'
            setSortOrder(newSortOrder)
        } else {
            // add default sort order for each column later
            if (colKey === 'title') {
                setSortOrder('ascending')
            } else {
                setSortOrder('descending')
            }
        }
        setColToSortBy(colKey)
    }

    // sort
    useEffect(() => {
        // sort by colKey
        const sortedResults = [...results]

        sortedResults.sort((a, b) => {
            if (a[colToSortBy] < b[colToSortBy]) {
                return sortOrder === 'ascending' ? -1 : 1
            } else if (a[colToSortBy] > b[colToSortBy]) {
                return sortOrder === 'ascending' ? 1 : -1
            } else {
                return 0
            }
        })
        setResults(sortedResults)
    }, [colToSortBy, sortOrder])

    // force re-render when results change
    useEffect(() => {
        setResults(results)
    }, [results])

    return (
        <div className="searchResultsContainerMargin">
            <div className="searchResultsContainer"> 
                <TopRow sortBy={toggleSortBy} colToSortBy={colToSortBy} sortOrder={sortOrder}/>
                {results.map((result, index) => <Result key={index} index={index} result={result}/>)}
            </div>
        </div>
    )  
}

export function KeywordSearch() {
    const urlParams = new URLSearchParams(window.location.search)
    var searchText = urlParams.get('q')

    const [results, setResults] = useState([])

    useEffect(() => {
        if (searchText === '' || searchText === null) {
            return
        }
        fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${searchText.replace(/ /g, '+')}&limit=100&fields=title,authors,referenceCount,citationCount,url,venue,year,authors,externalIds`).then(res => res.json()).then(
            (result) => {
                var papers = result['data']
                for (var i = 0; i < papers.length; i++) {
                    papers[i] = processPaper(papers[i])

                }
                console.log(papers.slice(0, 5))
                setResults(papers)
            }
        )
    }, [searchText])

    let titleContainer = <></>
    if (searchText === null) {
        titleContainer = <></>
    } else {
        titleContainer = <div className="titleContainer">
            <div className="left unselectable">Results for "{searchText}"</div>
        </div>
    }
    

    return (
        <>
        <div className="header">
            <SearchBar/>
            {titleContainer}
         </div>
        <SearchResults results={results} setResults={setResults}/>
        </>
    )  
}

export function Citations() {
    let urlParams = new URLSearchParams(window.location.search)
    let paperId = urlParams.get('paperId')
    let title = urlParams.get('title')
    let authorString = urlParams.get('authorString')
    let directUrl = urlParams.get('directUrl')

    const [results, setResults] = useState([])

    useEffect(() => {
        if (paperId === '') {
            return
        } else {
            // try to get paperId from url
            fetch(`https://api.semanticscholar.org/graph/v1/paper/${paperId}/citations?fields=venue,title,authors,url,year,externalIds,paperId,citationCount,referenceCount`).then(res => res.json()).then(
                (result) => {
                    console.log(result['data'])
                    let citingPapers = result['data'].map(item => processPaper(item['citingPaper']))
                    setResults(citingPapers)
                }
            )
        }
    }, [paperId])

    function handleCitationClick() {
        window.location.href = `/references?paperId=${paperId}&title=${title}&authorString=${authorString}&directUrl=${directUrl}`
    }
            

    return (
        <>  
        <div className="header">
            <SearchBar/>
            <div className="titleContainer">
                <div className="left unselectable" style={{cursor: "pointer" }} onClick={handleCitationClick}>Citations</div>
                <div className="flexFiller"></div>
                <div className="right">
                    <div><a href={directUrl} target="_blank">{title}</a></div>
                    <div><a  href={directUrl} target="_blank">{authorString}</a></div>
                </div>
            </div>
        </div>
        <SearchResults results={results} setResults={setResults}/>
        </>
    )

}

export function References() {
    let urlParams = new URLSearchParams(window.location.search)
    let paperId = urlParams.get('paperId')
    let title = urlParams.get('title')
    let authorString = urlParams.get('authorString')
    let directUrl = urlParams.get('directUrl')

    const [results, setResults] = useState([])

    useEffect(() => {
        if (paperId === '') {
            return
        } else {
            // try to get paperId from url
            fetch(`https://api.semanticscholar.org/graph/v1/paper/${paperId}/references?fields=venue,title,authors,url,year,externalIds,paperId,citationCount,referenceCount`).then(res => res.json()).then(
                (result) => {
                    console.log(result['data'])
                    let citedPapers = result['data'].map(item => processPaper(item['citedPaper']))
                    setResults(citedPapers)
                }
            )
        }
    }, [paperId])

    function handleReferenceClick() {
        window.location.href = `/citations?paperId=${paperId}&title=${title}&authorString=${authorString}&directUrl=${directUrl}`
    }

    return (
        <> 
        <div className="header">
            <SearchBar/>
            <div className="titleContainer">
                <div className="left unselectable" style={{cursor: "pointer"}} onClick={handleReferenceClick}>References</div>
                <div className="flexFiller"></div>
                <div className="right">
                    <div><a href={directUrl} target="_blank">{title}</a></div>
                    <div><a  href={directUrl} target="_blank">{authorString}</a></div>
                </div>
            </div>
        </div>
        <SearchResults results={results} setResults={setResults}/>
        </>
    )

}


