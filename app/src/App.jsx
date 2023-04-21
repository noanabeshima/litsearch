import { useState, useEffect } from 'react'
import './App.css'
import {KeywordSearch, Citations, References} from './SearchResults'
import { useNavigate } from 'react-router-dom'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

function RedirectToSearch() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/search')
  }, [navigate])
  return null
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToSearch />,
  },
  {
    path: "/search",
    element: <KeywordSearch />,
  },
  {
    path: "/citations",
    element: <Citations />,
  },
  {
    path: "/references",
    element: <References />,
  }
])

function App() {
  return (
    <>
      <div className="App">
        <RouterProvider router={router}/>
      </div>
    </>
  )
}

export default App
