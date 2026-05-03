import React from 'react';
import { Link } from 'react-router-dom';

export default function UserAvatar({ user, size = 40, showName = false, to = null, className = '' }) {
  // user may be an id string, a user object, or an avatar url string
  if (!user) {
    const initials = 'U';
    const el = (
      <div style={{ width: size, height: size }} className={`rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black ${className}`}>{initials}</div>
    );
    return showName ? <div className="flex items-center gap-2">{el}<div className="text-sm">Unknown</div></div> : el;
  }

  let userObj = null;
  let avatarUrl = null;
  let displayName = null;

  if (typeof user === 'string') {
    // Could be an id or a URL
    if (/^https?:\/\//.test(user)) {
      avatarUrl = user;
    } else {
      userObj = { _id: user, name: null };
    }
  } else if (typeof user === 'object') {
    userObj = user;
    avatarUrl = user?.avatar?.secure_url || user?.avatar?.url || user?.avatar || null;
  }

  displayName = (userObj && (userObj.name || userObj.fullName || userObj.email)) || null;

  const initials = String(displayName || (userObj && (userObj.email || userObj._id) ) || 'U').charAt(0).toUpperCase();

  const img = avatarUrl ? (
    <img src={avatarUrl} alt={displayName || 'avatar'} style={{ width: size, height: size }} className={`rounded-full object-cover ${className}`} />
  ) : (
    <div style={{ width: size, height: size }} className={`rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black ${className}`}>{initials}</div>
  );

  const content = showName ? (
    <div className="flex items-center gap-2">
      {img}
      <div className="text-sm">{displayName || (userObj && (userObj.email || userObj._id)) || 'User'}</div>
    </div>
  ) : img;

  if (to) return <Link to={to} className="inline-block">{content}</Link>;
  return content;
}
