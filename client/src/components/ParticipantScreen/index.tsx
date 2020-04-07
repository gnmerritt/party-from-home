import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { LocalParticipant, RemoteParticipant, RemoteVideoTrack, LocalVideoTrack } from 'twilio-video';
import { Overlays } from '../../Overlay';
import UserInfoOverlayArea from './Overlays/UserInfoOverlays/UserInfoOverlayArea';
import GameSpaceOverlayArea from './Overlays/GameSpaceOverlays/GameSpaceOverlayArea';
import EphemeralOverlayArea from './Overlays/EphemeralOverlays/EphemeralOverlayArea';

import BandwidthWarning from '../BandwidthWarning/BandwidthWarning';

import usePublications from '../../hooks/usePublications/usePublications';
import useIsTrackSwitchedOff from '../../hooks/useIsTrackSwitchedOff/useIsTrackSwitchedOff';
import useTrack from '../../hooks/useTrack/useTrack';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: `100%`,
      overflow: 'hidden',
      cursor: 'pointer',
      '& video': {
        filter: 'none',
      },
      '& svg': {
        stroke: 'black',
        strokeWidth: '0.8px',
      },
    },
    isVideoSwitchedOff: {
      '& video': {
        filter: 'blur(4px) grayscale(1) brightness(0.5)',
      },
    },
    infoContainer: {
      position: 'absolute',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'top',
      // justifyContent: 'space-between',
      height: '100%',
      width: '100%',
      background: 'transparent',
      paddingTop: '0.4em',
    },
    hideVideo: {
      background: 'black',
    },
    upperOverlayContainer: {
      height: '24px',
      paddingLeft: '0.4em',
      paddingRight: '0.4em',
    },
    lowerOverlayContainer: {
      flexGrow: 1,
    },
    lowerLeftOverlayContainer: {
      width: '75%',
      height: '100%',
      display: 'inline-block',
    },
    lowerRightOverlayContainer: {
      width: '25%',
      height: '100%',
      display: 'inline-block',
    },
  })
);

interface ParticipantScreenProps {
  participant: LocalParticipant | RemoteParticipant;
  children: React.ReactNode;
  onClick: () => void;
  maxWidth?: number;
  maxHeight?: number;
  overlays?: Overlays;
}

export default function ParticipantScreen({
  participant,
  onClick,
  children,
  maxWidth,
  maxHeight,
  overlays,
}: ParticipantScreenProps) {
  const publications = usePublications(participant);

  const videoPublication = publications.find(p => p.trackName === 'camera');

  const isVideoEnabled = Boolean(videoPublication);

  const videoTrack = useTrack(videoPublication);
  const isVideoSwitchedOff = useIsTrackSwitchedOff(videoTrack as LocalVideoTrack | RemoteVideoTrack);

  const classes = useStyles();

  return (
    <div
      className={clsx(classes.container, {
        [classes.isVideoSwitchedOff]: isVideoSwitchedOff,
      })}
      onClick={onClick}
      data-cy-participant={participant.identity}
      style={{ width: maxWidth || 'inherit' }}
    >
      <div className={clsx(classes.infoContainer, { [classes.hideVideo]: !isVideoEnabled })}>
        <div className={clsx(classes.upperOverlayContainer)}>
          <UserInfoOverlayArea participant={participant} overlays={overlays?.userInfoOverlays || []} />
        </div>
        <div className={clsx(classes.lowerOverlayContainer)}>
          <div className={clsx(classes.lowerLeftOverlayContainer)}>
            <GameSpaceOverlayArea participant={participant} overlay={overlays?.gameSpaceOverlay} />
          </div>
          <div className={clsx(classes.lowerRightOverlayContainer)}>
            <EphemeralOverlayArea participant={participant} overlays={overlays?.ephemeralOverlays || []} />
          </div>
        </div>
      </div>
      {/* TODO(gail.wilson) -- Make Bandwidth warning a "screen takeover" overlay of some sort */}
      {isVideoSwitchedOff && <BandwidthWarning />}
      {children}
    </div>
  );
}
