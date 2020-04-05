import React, { ReactChild } from 'react';
import Participant from '../Participant/Participant';
import { styled } from '@material-ui/core/styles';
import { Overlays } from '../../Overlay';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useUsers from '../../hooks/partyHooks/useUsers';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import useMainSpeaker from '../../hooks/useMainSpeaker/useMainSpeaker';

const Grid = WidthProvider(GridLayout);

// todo(carlos): allow for different layout strategies
const getRoomLayout = (participants: any[], primarySpeaker: number) => {
  const layout = [];
  const total = participants.length;
  var columns = 2;
  var pWidth = 1;
  var pHeight = 1;
  var sWidth = 1;
  var sHeight = 1;
  var rowHeight = 680;
  var remap = undefined;

  if (total <= 2) {
    columns = 2;
    rowHeight = 390;
  } else if (total <= 4) {
    columns = 4;
    rowHeight = 170;
    pWidth = 3;
    pHeight = 2.8;
  } else if (total <= 12) {
    columns = 5;
    rowHeight = 160;
    pWidth = 3;
    pHeight = 2.8;
  } else if (total <= 22) {
    columns = 6;
    rowHeight = 130;
    pWidth = 3;
    pHeight = 2.8;
  } else if (total <= 27) {
    columns = 6;
    rowHeight = 130;
    pWidth = 2;
    pHeight = 2;
  } else if (total <= 39) {
    columns = 7;
    rowHeight = 110;
    pWidth = 2;
    pHeight = 2;
  } else {
    columns = 9;
    rowHeight = 80;
    pWidth = 4;
    pHeight = 4;
  }

  var rows = Math.floor(total / columns);
  var x = 0;
  var y = 0;
  var px = primarySpeaker % columns;
  var py = Math.floor(primarySpeaker / columns);
  const w = pWidth;
  const h = pHeight;
  if (py + h > rows - Math.ceil(sHeight)) {
    rows -= rows - (py + h + sHeight);
  }

  // Edge correction assumes w < cols and h < height
  if (px > columns - Math.ceil(w)) {
    // dominant is too far to right
    console.log(`Speaker ${primarySpeaker} too far right`);
    const newPrimarySpeaker = primarySpeaker + (columns - (px + Math.ceil(w)));
    if (!remap) remap = primarySpeaker;

    primarySpeaker = newPrimarySpeaker;
    px = newPrimarySpeaker % columns;
    console.log(`New index: ${primarySpeaker}, new X: ${px}`);
  }

  if (py > rows - Math.ceil(h)) {
    console.log(`Speaker ${primarySpeaker} too far down`);
    // dominant is too far down
    const newY = py + (rows - (py + Math.ceil(h)) + 1);
    const newPrimarySpeaker = newY * columns + px;
    if (!remap) remap = primarySpeaker;

    primarySpeaker = newPrimarySpeaker;
    py = newY;
    console.log(`New index: ${primarySpeaker}, new Y: ${py}`);
  }

  for (var i = 0; i < participants.length; i++) {
    if (i === primarySpeaker) {
      layout.push({ i: i.toString(), x: x, y: y, w, h, static: true });
    } else {
      layout.push({ i: i.toString(), x: x, y: y, w: sWidth, h: sHeight, static: true });
    }

    if (y >= py && y < py + Math.ceil(h)) {
      if (y === py && x === px) {
        x += Math.ceil(w);
      } else if (y !== py && x + 1 === px) {
        x += Math.ceil(w) + 1;
      } else {
        x += 1;
      }
    } else {
      x += 1;
    }

    if (x >= columns) {
      y += 1;

      if (px === 0 && y >= py + 1 && y < py + Math.ceil(h)) {
        x = Math.ceil(w);
      } else {
        x = 0;
      }
    }
  }

  if (remap) {
    // switch the layout so the primary speaker has the correct coordinates
    const speaker = layout[primarySpeaker];
    const nonSpeaker = layout[remap];
    layout[remap] = { ...speaker, i: nonSpeaker.i };
    layout[primarySpeaker] = { ...nonSpeaker, i: speaker.i };
  }

  return { layout, layoutParticipants: participants, columns, rowHeight };
};

const WidgetContainer = styled('div')({
  height: '100%',
});

export interface Props {
  overlays?: Overlays;
  children?: ReactChild | ReactChild[] | undefined;
}

export default function ParticipantGrid(props: Props) {
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();
  const speaker = useMainSpeaker();
  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const { users } = useUsers();

  const localIdentity = localParticipant.identity;
  var roomParticipants: any[] = [];
  var dominant = -1;

  if (props.children) {
    // special case to render widget
    roomParticipants.push('widget');
    dominant = 0;
  }

  roomParticipants.push(localParticipant);
  roomParticipants.push(...participants);

  roomParticipants = roomParticipants.sort((a, b) => {
    if (a === 'widget') return -1;

    if (a.identity < b.identity) return -1;
    else return 1;
  });

  if (dominant < 0) dominant = roomParticipants.findIndex(p => p.identity === speaker.identity);

  const { layout, layoutParticipants, columns, rowHeight } = getRoomLayout(roomParticipants, dominant);

  const basePriority = participants.length > 10 ? 'low' : 'standard';

  return (
    <Grid layout={layout} cols={columns} rowHeight={rowHeight} margin={[4, 4]} useCSSTransforms={true}>
      {layoutParticipants.map((participant, i) => {
        if (participant === 'widget') {
          return (
            <div key={i}>
              <WidgetContainer style={{ width: layout[i].w * (rowHeight / 0.5625) }}>{props.children}</WidgetContainer>
            </div>
          );
        } else {
          return (
            <div key={i}>
              <Participant
                key={i}
                participant={participant}
                onClick={() => setSelectedParticipant(participant)}
                displayName={users.find(u => u.identity === participant.identity)?.displayName}
                maxWidth={layout[i].w * (rowHeight / 0.5625)}
                maxHeight={rowHeight}
                videoPriority={i === dominant || participant === localParticipant ? 'high' : basePriority}
                disableAudio={participant.identity === localIdentity}
                enableScreenShare={i === dominant}
                overlays={props.overlays}
              />
            </div>
          );
        }
      })}
    </Grid>
  );
}
