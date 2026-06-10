import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

type PostPreviewData = {
  id: string
  title: string
  authorUsername: string
  stars: number
  comments: number
  excerpt: string
  publishedAt: string
}

type Thread = { id: string; name: string; posts: number; stars: number }
type ThreadDetail = { id: string; name: string; stars: number; posts: PostPreviewData[] }
type SelectOption = { id: string; name: string }
type Profile = { username: string; bloggerSince: string; bio: string; email?: string; mascot?: string }
type PostDetailData = { title: string; authorUsername: string; stars: number; body: string; publishedAt: string }
type CommentData = {
  id: string
  username: string
  body: string
  publishedAt: string
  color: string
  replyingTo: null | { id: string; username: string; body: string; color: string }
}
type PostFormValues = { title: string; thread: string; body: string }

const currentUser = { username: 'AndMarsh', avatarVariant: 'blue', color: 'blue' }
const fallbackPosts: PostPreviewData[] = [
  {
    id: 'robot-life',
    title: 'How to Live like a Robot',
    authorUsername: 'robotfan42',
    stars: 18,
    comments: 6,
    excerpt: 'Tiny routines, predictable rhythms, and a few chrome-plated tricks for making ordinary days feel orderly.',
    publishedAt: '2026-04-13T15:23:00',
  },
  {
    id: 'pool-float',
    title: 'How to Float in a Pool',
    authorUsername: 'poolnoodle',
    stars: 9,
    comments: 3,
    excerpt: 'A patient guide to breathing, balance, and letting the water do more of the work.',
    publishedAt: '2026-05-04T12:15:00',
  },
  {
    id: 'autism-introspection',
    title: 'Introspection for Adults with Autism',
    authorUsername: 'thoughtful_dev',
    stars: 27,
    comments: 11,
    excerpt: 'Notes on noticing your own energy, patterns, needs, and the quiet signals that build self-trust.',
    publishedAt: '2026-05-18T09:40:00',
  },
]
const fallbackThreads: Thread[] = [
  { id: 'robots', name: 'ROBOTS', posts: 3, stars: 6 },
  { id: 'learning', name: 'LEARNING', posts: 3, stars: 6 },
  { id: 'coding', name: 'CODING', posts: 3, stars: 6 },
  { id: 'swimming', name: 'SWIMMING', posts: 3, stars: 6 },
]
const fallbackThreadOptions: SelectOption[] = [
  { id: 'general', name: 'General' },
  { id: 'questions', name: 'Questions' },
  { id: 'show-and-tell', name: 'Show and Tell' },
]
const fallbackThreadDetail: ThreadDetail = { id: 'robots', name: 'Robots', stars: 6, posts: fallbackPosts }
const ownedPost: PostDetailData = {
  title: 'How to Live like a Robot',
  authorUsername: 'AndMarsh',
  stars: 18,
  body: "Robots code all day. And that's what I am doing, but I also go outside sometimes. Who knows I read articles on Medium about API design and I do my classes.",
  publishedAt: '4/13/26 3:23 PM',
}
const publicPost: PostDetailData = { ...ownedPost, authorUsername: 'robotfan42' }
const fallbackComments: CommentData[] = [
  { id: 'c1', username: 'robotfan42', body: 'I schedule everything and somehow still forget snacks.', publishedAt: '4/13/26 4:02 PM', color: 'violet', replyingTo: null },
  { id: 'c2', username: 'beep_beep', body: 'The outside part sounds suspicious but useful.', publishedAt: '4/13/26 4:17 PM', color: 'green', replyingTo: null },
  { id: 'c3', username: 'AndMarsh', body: 'Fresh air was not in the original spec.', publishedAt: '4/13/26 4:31 PM', color: 'blue', replyingTo: { id: 'c2', username: 'beep_beep', body: 'The outside part sounds suspicious but useful.', color: 'green' } },
  { id: 'c4', username: 'poolnoodle', body: 'Try a ten minute walk between deep work blocks.', publishedAt: '4/13/26 5:09 PM', color: 'cyan', replyingTo: null },
  { id: 'c5', username: 'syntax_error', body: 'I need a firmware update for Mondays.', publishedAt: '4/13/26 5:42 PM', color: 'pink', replyingTo: null },
  { id: 'c6', username: 'garden_gnome', body: 'Plants also like routine. This checks out.', publishedAt: '4/13/26 6:10 PM', color: 'amber', replyingTo: null },
  { id: 'c7', username: 'byte_sized', body: 'The trick is making the routine small enough to restart.', publishedAt: '4/13/26 7:01 PM', color: 'indigo', replyingTo: null },
  { id: 'c8', username: 'capybara_dev', body: 'Capybara mode is just robot mode with better naps.', publishedAt: '4/13/26 7:26 PM', color: 'rose', replyingTo: null },
  { id: 'c9', username: 'learner_404', body: 'Saving this for finals week.', publishedAt: '4/14/26 8:19 AM', color: 'teal', replyingTo: null },
  { id: 'c10', username: 'quiet_thread', body: 'This made routines feel less rigid.', publishedAt: '4/14/26 10:44 AM', color: 'slate', replyingTo: { id: 'c7', username: 'byte_sized', body: 'The trick is making the routine small enough to restart.', color: 'indigo' } },
  { id: 'c11', username: 'runtime_randy', body: 'Remember to reboot with water.', publishedAt: '4/14/26 11:03 AM', color: 'lime', replyingTo: null },
]
const myProfile: Profile = {
  username: 'AndMarsh',
  bloggerSince: '3/26',
  bio: 'I like capybaras and also I like music. I like rock especially Audioslave.',
  email: 'andmarsh@example.com',
  mascot: 'placeholder-1',
}
const otherProfile: Profile = { username: 'TrOllRxD', bloggerSince: '5/26', bio: myProfile.bio }
const fallbackMascots: SelectOption[] = [
  { id: 'placeholder-1', name: 'Mascot option 1' },
  { id: 'placeholder-2', name: 'Mascot option 2' },
  { id: 'placeholder-3', name: 'Mascot option 3' },
]

const routeLinks = [
  ['Home', '/home'], ['Feed', '/feed'], ['Threads', '/threads'], ['View Thread', '/view-thread'],
  ['Post Details', '/post-details'], ['My Post Details', '/my-post-details'], ['My Profile', '/my-profile'],
  ['User Profile', '/user-profile'], ['Admin Profile', '/admin-profile'], ['Create Post', '/create-post'],
  ['Edit Post', '/edit-post'], ['Edit Profile', '/edit-profile'], ['Login', '/login'], ['Register', '/register'],
  ['Forgot Password', '/forgot-password'], ['New Password', '/new-password'], ['Links', '/links'],
]

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}
function text(...values: unknown[]) {
  const found = values.find((value) => typeof value === 'string' && value.trim())
  return typeof found === 'string' ? found : ''
}
function num(...values: unknown[]) {
  const found = values.find((value) => value !== undefined && value !== null && value !== '')
  const parsed = Number(found)
  return Number.isFinite(parsed) ? parsed : 0
}
function arrayFrom(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) return payload
  const object = asRecord(payload)
  for (const key of keys) {
    if (Array.isArray(object[key])) return object[key] as unknown[]
  }
  return []
}
function formatTimestamp(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit',
  }).format(date)
}
function normalizePosts(payload: unknown, fallback = fallbackPosts) {
  const list = arrayFrom(payload, ['posts', 'data', 'items'])
  const posts = list.map((raw, index) => {
    const item = asRecord(raw)
    const author = asRecord(item.author)
    const title = text(item.title, item.name)
    if (!title) return null
    return {
      id: text(item.id, item.postId) || `post-${index}`,
      title,
      authorUsername: text(item.authorUsername, item.username, author.username, author.name) || 'unknown',
      stars: num(item.stars, item.starCount, item.likes),
      comments: num(item.comments, item.commentCount, item.replies, item.replyCount),
      excerpt: text(item.excerpt, item.summary, item.body, item.content, item.description),
      publishedAt: text(item.publishedAt, item.createdAt, item.timestamp, item.date),
    }
  }).filter(Boolean) as PostPreviewData[]
  return posts.length ? posts : fallback
}
function normalizeOptions(payload: unknown, fallback: SelectOption[], mode: 'thread' | 'mascot' | 'generic' = 'generic') {
  const list = arrayFrom(payload, mode === 'mascot' ? ['mascots', 'data', 'items'] : ['threads', 'data', 'items', 'mascots'])
  const options = list.map((raw, index) => {
    if (typeof raw === 'string') return { id: raw, name: raw }
    const item = asRecord(raw)
    const name = text(item.name, item.label, item.title, item.threadName, item.mascotName)
    if (!name) return null
    return { id: text(item.id, item.threadId, item.mascotId, item.value) || String(index), name }
  }).filter(Boolean) as SelectOption[]
  return options.length ? options : fallback
}
function normalizeThreads(payload: unknown) {
  const list = arrayFrom(payload, ['threads', 'data', 'items'])
  const threads = list.map((raw, index) => {
    if (typeof raw === 'string') return { id: raw, name: raw, posts: 0, stars: 0 }
    const item = asRecord(raw)
    const name = text(item.name, item.label, item.title, item.threadName)
    if (!name) return null
    return {
      id: text(item.id, item.threadId, item.value) || String(index),
      name,
      posts: num(item.posts, item.postCount, item.totalPosts),
      stars: num(item.stars, item.starCount, item.totalStars),
    }
  }).filter(Boolean) as Thread[]
  return threads.length ? threads : fallbackThreads
}
function normalizeThreadDetail(payload: unknown) {
  const root = asRecord(payload)
  const item = asRecord(root.thread ?? root.data ?? payload)
  return {
    id: text(item.id, item.threadId) || fallbackThreadDetail.id,
    name: text(item.name, item.label, item.title, item.threadName) || fallbackThreadDetail.name,
    stars: num(item.stars, item.starCount, item.totalStars) || fallbackThreadDetail.stars,
    posts: normalizePosts(item.posts ?? item.items ?? item.postList, fallbackPosts),
  }
}
function normalizePostDetail(payload: unknown, fallback: PostDetailData) {
  const root = asRecord(payload)
  const item = asRecord(root.post ?? root.data ?? payload)
  const author = asRecord(item.author)
  return {
    title: text(item.title, item.name) || fallback.title,
    authorUsername: text(item.authorUsername, item.username, author.username) || fallback.authorUsername,
    stars: num(item.stars, item.starCount) || fallback.stars,
    body: text(item.body, item.content, item.description) || fallback.body,
    publishedAt: text(item.publishedAt, item.createdAt) || fallback.publishedAt,
  }
}
function normalizeComments(payload: unknown) {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  const possible: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.comments)
      ? root.comments
      : Array.isArray(data.comments)
        ? data.comments
        : Array.isArray(root.data)
          ? root.data
          : []
  if (!possible.length) return fallbackComments
  const summaries = new Map<string, CommentData>()
  const comments = possible.map((raw, index) => {
    const item = asRecord(raw)
    const author = asRecord(item.author)
    const comment: CommentData = {
      id: text(item.id) || `comment-${index}`,
      username: text(item.username, item.authorUsername, author.username) || 'unknown',
      body: text(item.body, item.content),
      publishedAt: text(item.publishedAt, item.createdAt),
      color: text(item.color) || 'blue',
      replyingTo: null,
    }
    summaries.set(comment.id, comment)
    return { comment, parentId: text(item.parentComment) }
  })
  return comments.map(({ comment, parentId }) => ({
    ...comment,
    replyingTo: parentId && summaries.has(parentId)
      ? { id: parentId, username: summaries.get(parentId)!.username, body: summaries.get(parentId)!.body, color: summaries.get(parentId)!.color }
      : null,
  }))
}
function normalizeProfile(payload: unknown) {
  const root = asRecord(payload)
  const item = asRecord(root.user ?? root.profile ?? root.data ?? payload)
  const mascot = asRecord(item.mascot)
  return {
    username: text(item.username, item.name) || myProfile.username,
    email: text(item.email) || myProfile.email,
    mascot: text(item.mascotId, mascot.id, item.mascot) || myProfile.mascot,
    bio: text(item.bio, item.description) || myProfile.bio,
    bloggerSince: myProfile.bloggerSince,
  }
}
function normalizeEditPost(payload: unknown): PostFormValues {
  const root = asRecord(payload)
  const item = asRecord(root.post ?? root.data ?? payload)
  const thread = asRecord(item.thread)
  return {
    title: text(item.title, item.name) || 'How to Live like a Robot',
    thread: text(item.threadId, thread.id, item.thread, item.categoryId) || 'general',
    body: text(item.body, item.content, item.description, item.excerpt) || "Robots code all day. And that's what I am doing, but I also go outside sometimes. Who knew fresh air could be useful?",
  }
}

function useRoute() {
  const [path, setPath] = useState(currentRoute())
  useEffect(() => {
    const handler = () => setPath(currentRoute())
    window.addEventListener('popstate', handler)
    window.addEventListener('app:navigate', handler)
    return () => {
      window.removeEventListener('popstate', handler)
      window.removeEventListener('app:navigate', handler)
    }
  }, [])
  return path === '/' ? '/links' : path
}
function basePath() {
  return import.meta.env.BASE_URL.replace(/\/$/, '')
}
function currentRoute() {
  const base = basePath()
  const path = window.location.pathname
  const withoutBase = base && path.startsWith(base) ? path.slice(base.length) || '/' : path
  return withoutBase || '/'
}
function navigate(to: string) {
  const base = basePath()
  window.history.pushState(null, '', `${base}${to}`)
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  window.dispatchEvent(new Event('app:navigate'))
}
function Link({ to, className, children, onClick, ariaLabel }: { to: string; className?: string; children: ReactNode; onClick?: () => void; ariaLabel?: string }) {
  return <a href={`${basePath()}${to}`} className={className} aria-label={ariaLabel} onClick={(event) => { event.preventDefault(); onClick?.(); navigate(to) }}>{children}</a>
}
function useOutsideEscape(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) onClose() }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  return ref
}
function usePosts(endpoint: string | null, fallback = fallbackPosts) {
  const [posts, setPosts] = useState(fallback)
  const [loading, setLoading] = useState(Boolean(endpoint))
  const [error, setError] = useState<unknown>(null)
  useEffect(() => {
    let active = true
    if (!endpoint) {
      const timeout = window.setTimeout(() => {
        if (active) {
          setPosts(fallback); setLoading(false); setError(null)
        }
      }, 0)
      return () => { active = false; window.clearTimeout(timeout) }
    }
    const resetTimeout = window.setTimeout(() => {
      if (active) {
        setLoading(true); setError(null)
      }
    }, 0)
    fetch(endpoint)
      .then((response) => { if (!response.ok) throw new Error('Request failed'); return response.json() })
      .then((data) => active && setPosts(normalizePosts(data, fallback)))
      .catch((reason) => { if (active) { setPosts(fallback); setError(reason) } })
      .finally(() => active && setLoading(false))
    return () => { active = false; window.clearTimeout(resetTimeout) }
  }, [endpoint, fallback])
  return { posts, loading, error }
}

function Avatar({ username, variant = 'blue' }: { username: string; variant?: string }) {
  return <span className={`avatar avatar-${variant}`}>{username.slice(0, 2).toUpperCase()}</span>
}
function StarToggleButton({ count, className = '', label, defaultStarred = true, size = 16 }: { count: number; className?: string; label: string; defaultStarred?: boolean; size?: number }) {
  const [starred, setStarred] = useState(defaultStarred)
  const action = starred ? `Unstar ${label}` : `Star ${label}`
  return (
    <button type="button" className={`metric star ${className}`} aria-pressed={starred} aria-label={action} title={action} onClick={(event) => { setStarred((value) => !value); event.currentTarget.blur() }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1L12 2Z" /></svg>
      <span>{count}</span>
    </button>
  )
}
function SiteNav({ path }: { path: string }) {
  const loggedIn = path !== '/feed'
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timeout = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(timeout)
  }, [path])
  useEffect(() => {
    const mountTimeout = window.setTimeout(() => open && setMounted(true), 0)
    const timeout = window.setTimeout(() => !open && setMounted(false), 180)
    document.body.classList.toggle('drawer-lock', open)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(mountTimeout); window.clearTimeout(timeout); document.body.classList.remove('drawer-lock'); document.removeEventListener('keydown', onKey) }
  }, [open])
  const navLinks = loggedIn ? [['Feed', '/feed'], ['Threads', '/threads'], ['Write', '/create-post']] : [['Feed', '/feed'], ['Threads', '/threads'], ['Login', '/login']]
  return (
    <header className="site-nav">
      <Link to="/home" className="brand">Idle Moments</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map(([label, to]) => <Link key={to} to={to} className={path === to ? 'active' : ''}>{label}</Link>)}
        {loggedIn && <Link to="/my-profile" className="avatar-link" ariaLabel={`Open ${currentUser.username}'s profile`}><Avatar username={currentUser.username} variant={currentUser.avatarVariant} /></Link>}
      </nav>
      <button type="button" className="menu-button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-drawer" onClick={() => setOpen((value) => !value)}>☰</button>
      {mounted && (
        <div className={`drawer-layer ${open ? 'open' : 'closing'}`}>
          <button type="button" className="drawer-backdrop" aria-label="Close navigation menu" onClick={() => setOpen(false)} />
          <aside id="mobile-drawer" className="drawer">
            <button type="button" className="drawer-close" aria-label="Close navigation menu" onClick={() => setOpen(false)}>×</button>
            {loggedIn && <Link to="/my-profile" className="drawer-profile" onClick={() => setOpen(false)}><Avatar username={currentUser.username} variant={currentUser.avatarVariant} /> @{currentUser.username}</Link>}
            {navLinks.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
          </aside>
        </div>
      )}
    </header>
  )
}
function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <main className={`page ${narrow ? 'narrow' : ''}`}>{children}</main>
}
function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`glass-panel ${className}`}>{children}</section>
}
function PostList({ posts, getPostHref = () => '/post-details' }: { posts: PostPreviewData[]; getPostHref?: (post: PostPreviewData) => string }) {
  return <div className="post-list">{posts.map((post) => <PostPreview key={post.id} post={post} to={getPostHref(post)} />)}</div>
}
function PostPreview({ post, to = '/post-details' }: { post: PostPreviewData; to?: string }) {
  return (
    <article className="click-card">
      <Link to={to} className="card-main">
        <h3>{post.title}</h3>
        <p className="muted">@{post.authorUsername}</p>
        <p>{post.excerpt}</p>
        <time>{formatTimestamp(post.publishedAt)}</time>
      </Link>
      <footer className="metrics">
        <StarToggleButton count={post.stars} label={post.title} />
        <span className="metric" aria-label={`${post.comments} comments`}>
          <svg className="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5.75A3.75 3.75 0 0 1 8.75 2h6.5A3.75 3.75 0 0 1 19 5.75v4.5A3.75 3.75 0 0 1 15.25 14H12l-4.4 3.3A1 1 0 0 1 6 16.5V14.1a3.75 3.75 0 0 1-1-2.55v-5.8Z" />
            <circle cx="9" cy="8.5" r="1" />
            <circle cx="12" cy="8.5" r="1" />
            <circle cx="15" cy="8.5" r="1" />
          </svg>
          {post.comments}
        </span>
      </footer>
    </article>
  )
}
function Menu({ triggerLabel, triggerText = '...', children }: { triggerLabel: string; triggerText?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useOutsideEscape(open, () => setOpen(false))
  return (
    <div className="menu-wrap" ref={ref}>
      <button type="button" className="dots" aria-label={triggerLabel} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{triggerText}</button>
      {open && <div className="menu-popover" onClick={() => setOpen(false)}>{children}</div>}
    </div>
  )
}
function ProfileCard({ profile, showEditAction = false, avatarVariant = 'blue' }: { profile: Profile; showEditAction?: boolean; avatarVariant?: string }) {
  return (
    <GlassPanel className="profile-card">
      <Avatar username={profile.username} variant={avatarVariant} />
      <div>
        <h1>{profile.username}</h1>
        <p className="pill">Blogger since {profile.bloggerSince}</p>
        <p>{profile.bio}</p>
      </div>
      {showEditAction && <Menu triggerLabel="Profile options"><Link to="/edit-profile">Edit Profile</Link></Menu>}
    </GlassPanel>
  )
}
function useLoad<T>(endpoint: string, fallback: T, normalize: (payload: unknown) => T) {
  const [data, setData] = useState(fallback)
  useEffect(() => {
    let active = true
    fetch(endpoint)
      .then((response) => { if (!response.ok) throw new Error('Request failed'); return response.json() })
      .then((payload) => active && setData(normalize(payload)))
      .catch(() => active && setData(fallback))
    return () => { active = false }
  }, [endpoint, fallback, normalize])
  return data
}

function LinksPage() {
  return <Page narrow><GlassPanel><h1>All Pages</h1><nav className="link-grid" aria-label="All pages">{routeLinks.map(([label, path]) => <Link key={path} to={path}><strong>{label}</strong><span>{path}</span></Link>)}</nav></GlassPanel></Page>
}
function HomePage() {
  return <Page><section className="home-hero glass-panel"><p className="eyebrow">Idle Moments</p><h1>Hobbies, not work.</h1><p>Welcome to Idle Moments, the simple, cozy, hobby only discussion forum. Share your hobbies, not your work.</p><Link to="/register" className="primary-action">Create Account</Link></section></Page>
}
function FeedPage() {
  const { posts } = usePosts('http://localhost:8080/api/posts')
  return <Page><GlassPanel><h1>Feed</h1><PostList posts={posts} /></GlassPanel></Page>
}
function ThreadsPage() {
  const threads = useLoad('http://localhost:8080/api/threads', fallbackThreads, normalizeThreads)
  return <Page><div className="thread-list standalone-threads">{threads.map((thread) => <article className="click-card thread-card" key={thread.id}><Link to="/view-thread" className="card-main"><h3>{thread.name}</h3><p className="muted">{thread.posts} posts</p></Link><footer className="metrics"><StarToggleButton count={thread.stars} label={thread.name} /></footer></article>)}</div></Page>
}
function ViewThreadPage() {
  const thread = useLoad('http://localhost:8080/api/threads/placeholder-thread', fallbackThreadDetail, normalizeThreadDetail)
  return <Page><GlassPanel><div className="section-head"><h1>{thread.name}</h1><StarToggleButton count={thread.stars} label={thread.name} size={20} /></div><PostList posts={thread.posts} /></GlassPanel></Page>
}
function CommentSection({ ownerMode = false, comments }: { ownerMode?: boolean; comments: CommentData[] }) {
  const [replyTarget, setReplyTarget] = useState<CommentData | null>(null)
  const [commentValue, setCommentValue] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState('')
  const composerRef = useRef<HTMLFormElement>(null)
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const canManage = (comment: CommentData) => ownerMode || comment.username === currentUser.username
  function reply(comment: CommentData) {
    setReplyTarget(comment)
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  function jump(id: string) {
    commentRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => setHighlighted(id), 200)
    window.setTimeout(() => setHighlighted(''), 1600)
  }
  return (
    <section className="comments">
      <h2>Comments</h2>
      <form ref={composerRef} className="composer" onSubmit={(event) => event.preventDefault()}>
        <Avatar username={currentUser.username} variant="blue" />
        <div className="composer-main">
          {replyTarget && <div className="reply-preview"><strong>Reply to @{replyTarget.username}</strong><p>{replyTarget.body}</p><button type="button" onClick={() => setReplyTarget(null)}>Clear</button></div>}
          <textarea value={commentValue} onChange={(event) => setCommentValue(event.target.value)} placeholder={replyTarget ? 'Write reply' : 'Write comment'} />
          <button type="submit" className="primary-action">{replyTarget ? 'Reply' : 'Comment'}</button>
        </div>
      </form>
      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} ref={(node) => { commentRefs.current[comment.id] = node }} className={`comment ${highlighted === comment.id ? 'highlighted' : ''}`}>
            <Avatar username={comment.username} variant={comment.color} />
            <div>
              <div className="comment-top"><strong>@{comment.username}</strong><time>{formatTimestamp(comment.publishedAt)}</time></div>
              {comment.replyingTo && <button type="button" className="reply-context" onClick={() => jump(comment.replyingTo!.id)}><Avatar username={comment.replyingTo.username} variant={comment.replyingTo.color} /><span>@{comment.replyingTo.username}</span><span>{comment.replyingTo.body}</span></button>}
              <p>{comment.body}</p>
              <button type="button" className="text-button" onClick={() => reply(comment)}>Reply</button>
            </div>
            {canManage(comment) && <div className="comment-menu"><Menu triggerLabel={`Actions for ${comment.username}'s comment`}><button type="button" onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}>Delete Comment</button></Menu></div>}
          </div>
        ))}
      </div>
    </section>
  )
}
function PostDetailsPage({ ownerMode = false }: { ownerMode?: boolean }) {
  const [post, setPost] = useState(ownerMode ? ownedPost : publicPost)
  const [comments, setComments] = useState(fallbackComments)
  useEffect(() => {
    let active = true
    fetch('http://localhost:8080/api/posts/placeholder-post', { credentials: 'include' })
      .then((response) => { if (!response.ok) throw new Error('Request failed'); return response.json() })
      .then((payload) => {
        if (!active) return
        setPost(normalizePostDetail(payload, ownerMode ? ownedPost : publicPost))
        setComments(normalizeComments(payload))
      })
      .catch(() => { if (active) { setPost(ownerMode ? ownedPost : publicPost); setComments(fallbackComments) } })
    return () => { active = false }
  }, [ownerMode])
  return (
    <Page>
      <GlassPanel>
        <article className="post-detail">
          <div className="section-head"><div><h1>{post.title}</h1><p className="muted">by {post.authorUsername}</p></div><div className="inline-actions"><StarToggleButton count={post.stars} label={post.title} size={20} />{ownerMode && <Menu triggerLabel="Post actions"><Link to="/edit-post">Edit Post</Link></Menu>}</div></div>
          <p className="post-body">{post.body}</p>
          <time>{formatTimestamp(post.publishedAt)}</time>
        </article>
        <CommentSection ownerMode={ownerMode} comments={comments} />
      </GlassPanel>
    </Page>
  )
}
function ProfilePage({ admin = false, other = false }: { admin?: boolean; other?: boolean }) {
  const profile = other ? otherProfile : myProfile
  const { posts } = usePosts(other ? 'http://localhost:8080/api/posts/placeholder-user' : 'http://localhost:8080/api/posts/me')
  return <Page><ProfileCard profile={profile} showEditAction={!other} avatarVariant={other ? 'violet' : 'blue'} /><GlassPanel><div className="section-head"><h2>{other ? `${profile.username}'s Posts` : 'My Posts'}</h2>{!other && <Link to="/create-post" className="primary-action">Write a new post</Link>}</div><PostList posts={posts} /></GlassPanel>{admin && <GlassPanel><h2 className="admin-title">Admin Controls</h2><div className="admin-grid"><AdminEditableList title="Mascots" endpoint="http://localhost:8080/api/mascots" fallbackItems={[{ id: 'owl', name: 'Owl' }, { id: 'hen', name: 'Hen' }, { id: 'hare', name: 'Hare' }, { id: 'capybara', name: 'Capybara' }]} newItemLabel="New Mascot" /><AdminEditableList title="Threads" endpoint="http://localhost:8080/api/threads" fallbackItems={[{ id: 'gaming', name: 'Gaming' }, { id: 'swimming', name: 'Swimming' }, { id: 'gardening', name: 'Gardening' }, { id: 'coding', name: 'Coding' }]} newItemLabel="New Thread" /></div></GlassPanel>}</Page>
}
function AdminEditableList({ title, endpoint, fallbackItems, newItemLabel }: { title: string; endpoint: string; fallbackItems: SelectOption[]; newItemLabel: string }) {
  const [items, setItems] = useState(fallbackItems)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingName, setEditingName] = useState('')
  useEffect(() => {
    let active = true
    fetch(endpoint).then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json() }).then((data) => active && setItems(normalizeOptions(data, fallbackItems))).catch(() => active && setItems(fallbackItems))
    return () => { active = false }
  }, [endpoint, fallbackItems, title])
  function save(id: string) {
    const nextName = editingName.trim()
    if (!nextName) return
    fetch(`${endpoint}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nextName }) }).catch(() => undefined)
    setItems((values) => values.map((item) => item.id === id ? { ...item, name: nextName } : item)); setEditingId(''); setEditingName('')
  }
  function add() {
    const nextName = newName.trim()
    if (!nextName) return
    const placeholder = { id: `placeholder-${Date.now()}`, name: nextName }
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nextName }) })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setItems((values) => [...values, data ? normalizeOptions([data], [placeholder])[0] : placeholder]))
      .catch(() => setItems((values) => [...values, placeholder]))
    setNewName('')
  }
  return <div className="admin-list"><h2>{title}</h2><ol>{items.map((item) => <li key={item.id}>{editingId === item.id ? <><input value={editingName} onChange={(e) => setEditingName(e.target.value)} /><button type="button" aria-label={`Save ${item.name}`} onClick={() => save(item.id)}>Save</button></> : <><span>{item.name}</span><button type="button" aria-label={`Edit ${item.name}`} onClick={() => { setEditingId(item.id); setEditingName(item.name) }}>Edit</button></>}</li>)}</ol><div className="inline-form"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={newItemLabel} /><button type="button" aria-label={`Add ${newItemLabel}`} onClick={add}>Add</button></div></div>
}
function PostForm({ title, submitLabel, initialValues = { title: '', thread: '', body: '' } }: { title: string; submitLabel: string; initialValues?: PostFormValues }) {
  const [form, setForm] = useState(initialValues)
  const [options, setOptions] = useState<SelectOption[]>(fallbackThreadOptions)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timeout = window.setTimeout(() => setForm(initialValues), 0)
    return () => window.clearTimeout(timeout)
  }, [initialValues])
  useEffect(() => {
    let active = true
    fetch('http://localhost:8080/api/threads').then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json() }).then((data) => active && setOptions(normalizeOptions(data, fallbackThreadOptions, 'thread'))).catch(() => active && setOptions(fallbackThreadOptions)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])
  return <Page narrow><GlassPanel><h1>{title}</h1><form className="form-grid" onSubmit={(e) => e.preventDefault()}><label htmlFor="postTitle">Post Title</label><input id="postTitle" name="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><label htmlFor="thread">Thread</label><select id="thread" name="thread" required value={form.thread} onChange={(e) => setForm({ ...form, thread: e.target.value })}><option value="">{loading ? 'Loading threads...' : 'Select a thread'}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select><label htmlFor="postBody">Post Body</label><textarea id="postBody" name="body" rows={8} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /><button className="primary-action" type="submit">{submitLabel}</button></form></GlassPanel></Page>
}
function EditPostPage() {
  const [values, setValues] = useState<PostFormValues>({ title: 'How to Live like a Robot', thread: 'general', body: "Robots code all day. And that's what I am doing, but I also go outside sometimes. Who knew fresh air could be useful?" })
  useEffect(() => { let active = true; fetch('http://localhost:8080/api/posts/placeholder-post').then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json() }).then((data) => active && setValues(normalizeEditPost(data))).catch(() => undefined); return () => { active = false } }, [])
  return <PostForm title="Edit Post" submitLabel="Save Changes" initialValues={values} />
}
function PasswordField({ id, label, value, onChange, autoComplete, requirement, wrapperFocus, setWrapperFocus }: { id: string; label: string; value: string; onChange: (value: string) => void; autoComplete: string; requirement?: boolean; wrapperFocus?: boolean; setWrapperFocus?: (value: boolean) => void }) {
  const [show, setShow] = useState(false)
  const reqs = [{ label: 'At least 8 characters', met: value.length >= 8 }, { label: 'One uppercase letter', met: /[A-Z]/.test(value) }, { label: 'One lowercase letter', met: /[a-z]/.test(value) }, { label: 'At least one number', met: /\d/.test(value) }]
  const aria = `${show ? 'Hide' : 'Show'} ${label.toLowerCase()}`
  return <div className="password-wrap" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setWrapperFocus?.(false) }}><label htmlFor={id}>{label}</label><div className="password-line"><input id={id} name={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} required minLength={requirement ? 8 : undefined} pattern={requirement ? '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}' : undefined} title={requirement ? 'Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one number.' : undefined} value={value} onFocus={() => setWrapperFocus?.(true)} onChange={(e) => onChange(e.target.value)} /><button type="button" aria-label={aria} onMouseDown={(e) => e.preventDefault()} onClick={() => setShow((v) => !v)}>{show ? 'Hide' : 'Show'}</button></div>{requirement && wrapperFocus && <div className="requirements"><strong>Password requirements</strong>{reqs.map((req) => <span key={req.label} className={req.met ? 'met' : ''}>{req.met ? '✓' : '○'} {req.label}</span>)}</div>}</div>
}
function MascotSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [mascots, setMascots] = useState(fallbackMascots)
  const [loading, setLoading] = useState(true)
  useEffect(() => { let active = true; fetch('http://localhost:8080/api/mascots').then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json() }).then((data) => active && setMascots(normalizeOptions(data, fallbackMascots, 'mascot'))).catch(() => active && setMascots(fallbackMascots)).finally(() => active && setLoading(false)); return () => { active = false } }, [])
  return <select id="mascot" name="mascot" value={value} onChange={(e) => onChange(e.target.value)}><option value="">{loading ? 'Loading mascots...' : 'Select a mascot'}</option>{mascots.map((mascot) => <option key={mascot.id} value={mascot.id}>{mascot.name}</option>)}</select>
}
function EditProfilePage() {
  const [form, setForm] = useState({ username: myProfile.username, email: myProfile.email ?? '', mascot: myProfile.mascot ?? '', bio: myProfile.bio })
  useEffect(() => { let active = true; fetch('http://localhost:8080/api/users/me').then((r) => { if (!r.ok) throw new Error('Request failed'); return r.json() }).then((data) => { const next = normalizeProfile(data); if (active) setForm({ username: next.username, email: next.email ?? '', mascot: next.mascot ?? '', bio: next.bio }) }).catch(() => undefined); return () => { active = false } }, [])
  return <Page narrow><GlassPanel><h1>Edit Profile</h1><form className="form-grid" onSubmit={(e) => e.preventDefault()}><label htmlFor="editUsername">Username</label><input id="editUsername" name="username" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><label htmlFor="editEmail">Email</label><input id="editEmail" name="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><label htmlFor="mascot">Mascot</label><MascotSelect value={form.mascot} onChange={(mascot) => setForm({ ...form, mascot })} /><label htmlFor="bio">Bio</label><textarea id="bio" maxLength={300} rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /><p className="count">{form.bio.length}/300</p><button className="primary-action" type="submit">Save Changes</button><p>Want to change your password? <Link to="/new-password">Change Password</Link></p></form></GlassPanel></Page>
}
function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  return <Page narrow><GlassPanel><h1>Login</h1><form className="form-grid" onSubmit={(e) => e.preventDefault()}><label htmlFor="usernameOrEmail">Username or Email</label><input id="usernameOrEmail" name="usernameOrEmail" autoComplete="username" required value={form.usernameOrEmail} onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })} /><PasswordField id="loginPassword" label="Password" autoComplete="current-password" value={form.password} onChange={(password) => setForm({ ...form, password })} /><Link to="/forgot-password">Forgot password?</Link><button type="submit" className="primary-action">Login</button><p>Don't have an account? <Link to="/register">Register Here</Link></p></form></GlassPanel></Page>
}
function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', mascot: '', bio: '', password: '', confirmPassword: '' })
  const [focused, setFocused] = useState(false)
  return <Page narrow><GlassPanel><h1>Register</h1><form className="form-grid" onSubmit={(e) => e.preventDefault()}><label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><label htmlFor="mascot">Mascot</label><MascotSelect value={form.mascot} onChange={(mascot) => setForm({ ...form, mascot })} /><label htmlFor="registerBio">Bio</label><textarea id="registerBio" maxLength={300} rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /><p className="count">{form.bio.length}/300</p><PasswordField id="password" label="Password" autoComplete="new-password" requirement wrapperFocus={focused} setWrapperFocus={setFocused} value={form.password} onChange={(password) => setForm({ ...form, password })} /><PasswordField id="confirmPassword" label="Confirm Password" autoComplete="new-password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} /><button className="primary-action" type="submit">Register</button></form></GlassPanel></Page>
}
function ForgotPasswordPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  return <Page narrow><GlassPanel><h1>Forgot Password</h1><form className="form-grid" onSubmit={(e) => e.preventDefault()}><label htmlFor="forgotUsernameOrEmail">Username or Email</label><input id="forgotUsernameOrEmail" name="usernameOrEmail" autoComplete="username" required value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} /><button className="primary-action" type="submit">Recover Account</button></form></GlassPanel></Page>
}
function NewPasswordPage() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [focused, setFocused] = useState(false)
  return <Page narrow><GlassPanel><h1>New Password</h1><form className="form-grid" onSubmit={(e: FormEvent) => e.preventDefault()}><PasswordField id="oldPassword" label="Old Password" autoComplete="current-password" value={form.oldPassword} onChange={(oldPassword) => setForm({ ...form, oldPassword })} /><PasswordField id="newPassword" label="New Password" autoComplete="new-password" requirement wrapperFocus={focused} setWrapperFocus={setFocused} value={form.newPassword} onChange={(newPassword) => setForm({ ...form, newPassword })} /><PasswordField id="confirmPassword" label="Confirm Password" autoComplete="new-password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} /><button className="primary-action" type="submit">Change Password</button></form></GlassPanel></Page>
}

function App() {
  const path = useRoute()
  const page = useMemo(() => {
    switch (path) {
      case '/home': return <HomePage />
      case '/feed': return <FeedPage />
      case '/threads': return <ThreadsPage />
      case '/view-thread': return <ViewThreadPage />
      case '/post-details': return <PostDetailsPage />
      case '/my-post-details': return <PostDetailsPage ownerMode />
      case '/my-profile': return <ProfilePage />
      case '/user-profile': return <ProfilePage other />
      case '/admin-profile': return <ProfilePage admin />
      case '/create-post': return <PostForm title="Create Post" submitLabel="Publish" />
      case '/edit-post': return <EditPostPage />
      case '/edit-profile': return <EditProfilePage />
      case '/login': return <LoginPage />
      case '/register': return <RegisterPage />
      case '/forgot-password': return <ForgotPasswordPage />
      case '/new-password': return <NewPasswordPage />
      default: return <LinksPage />
    }
  }, [path])
  return <><SiteNav path={path} />{page}</>
}

export default App
