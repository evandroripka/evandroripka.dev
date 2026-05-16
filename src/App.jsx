import { useCallback, useEffect, useMemo, useState } from 'react'
import ProjectReviewModal from './components/layout/ProjectReviewModal'
import AdminDashboard from './pages/AdminDashboard'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [isProjectReviewOpen, setIsProjectReviewOpen] = useState(false)

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const route = useMemo(() => parseRoute(path), [path])
  const openProjectReview = useCallback(() => setIsProjectReviewOpen(true), [])
  const closeProjectReview = useCallback(() => setIsProjectReviewOpen(false), [])

  return (
    <>
      {route.name === 'admin' ? (
        <AdminDashboard />
      ) : route.name === 'project' ? (
        <ProjectPage slug={route.slug} onProjectReviewOpen={openProjectReview} />
      ) : (
        <HomePage onProjectReviewOpen={openProjectReview} />
      )}

      {route.name === 'admin' ? null : <ProjectReviewModal isOpen={isProjectReviewOpen} onClose={closeProjectReview} />}
    </>
  )
}

function parseRoute(path) {
  if (/^\/(?:admin|my-panel)(?:\/.*)?$/.test(path)) {
    return {
      name: 'admin',
    }
  }

  const projectMatch = path.match(/^\/(?:projects|work)\/([^/]+)\/?$/)

  if (projectMatch) {
    return {
      name: 'project',
      slug: decodeURIComponent(projectMatch[1]),
    }
  }

  return { name: 'home' }
}
