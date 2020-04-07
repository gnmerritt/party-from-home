import React, { useState, useRef, useCallback } from 'react';
import AboutDialog from '../AboutDialog/AboutDialog';
import IconButton from '@material-ui/core/IconButton';
import MenuContainer from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreIcon from '@material-ui/icons/MoreVert';
import Settings from '@material-ui/icons/Settings';
import DeveloperMode from '@material-ui/icons/DeveloperMode';
import UserAvatar from '../UserAvatar/UserAvatar';
import AdminPanel from '../../AdminPanel/AdminPanel';
import DevPanel from '../../DevPanel';

import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export default function Menu() {
  const { user, signOut } = useAppState();
  const { room, localTracks } = useVideoContext();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(() => {
    room.disconnect?.();
    localTracks.forEach(track => track.stop());
    signOut?.();
  }, [room.disconnect, localTracks, signOut]);

  return (
    <div ref={anchorRef}>
      {process.env.REACT_APP_USE_MOCKS && (
        <>
          <IconButton color="inherit" onClick={() => setDevOpen(state => !state)}>
            <DeveloperMode />
          </IconButton>
          <DevPanel open={devOpen} onClose={() => setDevOpen(false)} />
        </>
      )}
      {user?.admin ? (
        <>
          <IconButton color="inherit" onClick={() => setAdminOpen(state => !state)}>
            <Settings />
          </IconButton>
          <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
        </>
      ) : null}
      <IconButton color="inherit" onClick={() => setMenuOpen(state => !state)}>
        {user ? <UserAvatar user={user} /> : <MoreIcon />}
      </IconButton>
      <MenuContainer open={menuOpen} onClose={() => setMenuOpen(state => !state)} anchorEl={anchorRef.current}>
        {user?.displayName && <MenuItem disabled>{user.displayName}</MenuItem>}
        <MenuItem onClick={() => setAboutOpen(true)}>About</MenuItem>
        {user && <MenuItem onClick={handleSignOut}>Logout</MenuItem>}
      </MenuContainer>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          setMenuOpen(false);
        }}
      />
    </div>
  );
}
