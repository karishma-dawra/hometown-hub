
import { useState, useEffect } from "react";
import "./App.css";

const communities = [
  { name: "Bikaner Community", location: "Bikaner, Rajasthan", members: 1240, icon: "🏜️", color: "#FFF0D9" },
  { name: "Chandigarh Connect", location: "Chandigarh, India", members: 890, icon: "🌳", color: "#DDF5E8" },
  { name: "Punjab Community", location: "Punjab, India", members: 2150, icon: "🌾", color: "#E8E5FF" },
];

const initialPosts = [
  { id: 1, author: "Aarav Sharma", initials: "AS", location: "Bikaner Community", time: "20 min ago", text: "Anyone remember the old streets and amazing kachoris near Kote Gate? Missing home today!", likes: 24, comments: 8, color: "#E6E0FF" },
  { id: 2, author: "Simran Kaur", initials: "SK", location: "Punjab Community", time: "1 hour ago", text: "Let's organise a virtual meetup this weekend for everyone living away from Punjab. Drop your ideas below!", likes: 36, comments: 12, color: "#FFE7D6" },
];

function App() {
  const [active, setActive] = useState("Home");
  const [posts, setPosts] = useState(initialPosts);
  const [liked, setLiked] = useState([]);
  const [postText, setPostText] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  useEffect(() => {
  fetch("http://localhost:5050/api/posts")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    })
    .then((data) => {
      setPosts(data);
    })
    .catch((error) => {
      console.error("Error loading posts:", error);
    });
}, []);

  
async function addPost() {
  if (!postText.trim()) return;

  try {
    const response = await fetch("http://localhost:5050/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: "You",
        content: postText.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to publish post");
    }

    const savedPost = await response.json();

    setPosts((currentPosts) => [
      {
        id: savedPost.id,
        author: savedPost.author,
        initials: "YO",
        location: "Your hometown",
        time: "Just now",
        text: savedPost.content,
        likes: savedPost.likes,
        comments: 0,
        color: "#DDF5E8",
      },
      ...currentPosts,
    ]);

    setPostText("");
    setShowComposer(false);
    setActive("Home");
  } catch (error) {
    console.error("Error publishing post:", error);
    alert("Could not publish your post. Please check that the backend is running.");
  }
}

  async function toggleLike(id) {
  if (liked.includes(id)) return;

  try {
    const response = await fetch(
      `http://localhost:5050/api/posts/${id}/like`,
      { method: "PATCH" }
    );

    if (!response.ok) {
      throw new Error("Failed to save like");
    }

    const data = await response.json();

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id ? { ...post, likes: data.likes } : post
      )
    );

    setLiked((currentLiked) => [...currentLiked, id]);
  } catch (error) {
    console.error("Error liking post:", error);
    alert("Could not save your like. Please try again.");
  }
}

  const navGroups = [
    { title: "MENU", items: [{ icon: "⌂", label: "Home" }, { icon: "◉", label: "Communities" }, { icon: "▦", label: "Events" }, { icon: "♧", label: "Notifications" }] },
    { title: "PERSONAL", items: [{ icon: "◎", label: "My Profile" }, { icon: "⚙", label: "Settings" }] },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setActive("Home")}>
          <span className="brand-mark">h.</span>
          <span>hometown<span className="brand-accent">hub</span></span>
        </a>

        <div className="sidebar-label">YOUR SPACE</div>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.title}>
            <p className="group-title">{group.title}</p>
            {group.items.map((item) => (
              <button
                className={`nav-item ${active === item.label ? "active" : ""}`}
                key={item.label}
                onClick={() => setActive(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.label === "Notifications" && <span className="notification-dot" />}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-community">
          <div className="mini-community-icon">✦</div>
          <h4>Home is a feeling.</h4>
          <p>Stay close to the people and places that matter.</p>
        </div>

        <div className="sidebar-profile">
          <div className="avatar avatar-small">KD</div>
          <div><strong>Karishma Dawra</strong><span>Community member</span></div>
          <span className="more-icon">···</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Your space <span>/</span> <strong>{active}</strong></div>
          <div className="topbar-actions">
            <span className="online-status"><i /> Community is active</span>
            <button className="icon-button" aria-label="Notifications" onClick={() => setActive("Notifications")}>♧</button>
            <div className="avatar avatar-small">KD</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">TUESDAY, OCTOBER 20</p>
              <h1>{active === "Home" ? "Your roots, your people." : active}</h1>
              <p className="welcome-description">
                {active === "Home"
                  ? "A little closer to home, wherever life takes you."
                  : `Explore ${active.toLowerCase()} and stay connected to your community.`}
              </p>
            </div>
            <button className="primary-button" onClick={() => { setShowComposer(!showComposer); setActive("Home"); }}>
              <span>＋</span> Create a post
            </button>
          </section>

          <section className="hero-banner">
            <div className="hero-copy">
              <span className="hero-tag">♥ YOUR HOMETOWN, ALWAYS</span>
              <h2>No matter how far<br />you go, <em>home stays.</em></h2>
              <p>Catch up with familiar faces, share a little news, and keep your community alive.</p>
              <button className="hero-button" onClick={() => setActive("Communities")}>Explore communities <span>→</span></button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="sun" />
              <div className="hill hill-back" />
              <div className="hill hill-front" />
              <div className="house house-one"><span /></div>
              <div className="house house-two"><span /></div>
              <div className="tree tree-one"><i /><b /></div>
              <div className="tree tree-two"><i /><b /></div>
              <div className="art-caption">where your story began <span>✦</span></div>
            </div>
          </section>

          {showComposer && (
            <section className="composer panel">
              <h3>Share something with your community</h3>
              <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="What's happening back home?" rows="3" />
              <div className="composer-actions">
                <button className="text-button" onClick={() => setShowComposer(false)}>Cancel</button>
                <button className="primary-button" onClick={addPost}>Publish post</button>
              </div>
            </section>
          )}

          <section className="stats-grid">
            <div className="stat-card"><span className="stat-icon peach">♧</span><div><p>Communities</p><strong>12</strong><span className="stat-note">Across 5 regions</span></div></div>
            <div className="stat-card"><span className="stat-icon green">◎</span><div><p>People connected</p><strong>4,280</strong><span className="stat-note">Growing together</span></div></div>
            <div className="stat-card"><span className="stat-icon purple">▦</span><div><p>Upcoming events</p><strong>08</strong><span className="stat-note">This month</span></div></div>
          </section>

          <div className="content-grid">
            <section className="feed-column">
              <div className="section-heading"><div><h2>{active === "Communities" ? "Your communities" : active === "Events" ? "Community events" : "Community feed"}</h2><p>Little updates that bring us closer.</p></div><button className="subtle-button" onClick={() => setActive("Communities")}>Explore all →</button></div>

              {active === "Communities" ? (
                <div className="community-list">
                  {communities.map((community) => (
                    <article className="panel community-card" key={community.name}>
                      <div className="community-symbol" style={{ background: community.color }}>{community.icon}</div>
                      <div className="community-details"><h3>{community.name}</h3><p>{community.location}</p><span>{community.members.toLocaleString()} members</span></div>
                      <button className="outline-button" onClick={(e) => e.currentTarget.textContent = "Joined ✓"}>Join community</button>
                    </article>
                  ))}
                </div>
              ) : active === "Events" ? (
                <div className="panel empty-state"><span>✦</span><h3>Good things happen together.</h3><p>Community events will appear here. Check back for meetups, celebrations, and local gatherings.</p></div>
              ) : active === "Notifications" || active === "Settings" || active === "My Profile" ? (
                <div className="panel empty-state"><span>✦</span><h3>{active === "Notifications" ? "You're all caught up!" : active === "Settings" ? "Your preferences" : "Your story, your profile"}</h3><p>{active === "Notifications" ? "New community activity will show up here." : active === "Settings" ? "Personalise your Hometown Hub experience." : "Your hometown and personal details will live here."}</p></div>
              ) : (
                posts.map((post) => (
                  <article className="post-card panel" key={post.id}>
                    <div className="post-header">
                      <div className="avatar" style={{ background: post.color }}>{post.initials}</div>
                      <div className="post-author"><strong>{post.author || "Community Member"}</strong><span>{post.location} · {post.time}</span></div>
                      <button className="more-button" aria-label="More options">···</button>
                    </div>
                    <p className="post-text">{post.text || post.content}</p>
                    <div className="post-meta"><span>{post.likes + (liked.includes(post.id) ? 1 : 0)} likes</span><span>{post.comments} comments</span></div>
                    <div className="post-actions">
                      <button className={liked.includes(post.id) ? "liked" : ""} onClick={() => toggleLike(post.id)}>{liked.includes(post.id) ? "♥ Liked" : "♡ Like"}</button>
                      <button onClick={() => alert("Comment feature will be connected in the next development phase.")}>○ Comment</button>
                      <button onClick={() => navigator.clipboard?.writeText(post.text)}>↗ Share</button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <aside className="right-column">
              <section className="panel hometown-panel">
                <div className="panel-heading"><h3>Your hometown</h3><button aria-label="Edit hometown" onClick={() => alert("Hometown editing will be added in the next phase.")}>✎</button></div>
                <div className="hometown-illustration">🏜️</div>
                <h2>Bikaner, Rajasthan</h2>
                <p>Where your roots run deep.</p>
                <div className="hometown-divider" />
                <div className="hometown-detail"><span>♡</span><div><strong>1,240 members</strong><small>in your community</small></div></div>
                <button className="full-outline-button" onClick={() => setActive("Communities")}>Visit community</button>
              </section>

              <section className="panel events-panel">
                <div className="panel-heading"><h3>Coming up</h3><button onClick={() => setActive("Events")}>View all</button></div>
                <div className="event-row"><div className="event-date"><strong>24</strong><span>OCT</span></div><div><strong>Hometown virtual meetup</strong><p>Online · 5:00 PM</p></div></div>
                <div className="event-row"><div className="event-date date-green"><strong>28</strong><span>OCT</span></div><div><strong>Stories from back home</strong><p>Community gathering</p></div></div>
              </section>

              <div className="quote-card"><span>“</span><p>You can take a person out of their hometown, but home never leaves the person.</p><small>THE HOMETOWN HUB COMMUNITY</small></div>
            </aside>
          </div>

          <footer className="footer">Made with care for every place we call home. <span>hometown<span className="brand-accent">hub</span> © 2026</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
