import React, { useCallback } from 'react';
import { Modal, styled, Theme } from '@material-ui/core';
import useApi from '../../hooks/useApi/useApi';

const Container = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  backgroundColor: theme.palette.background.default,
  width: '400px',
  height: '500px',
  marginTop: '-250px',
  marginLeft: '-200px',
}));

interface Props {
  open: boolean;
  onClose?: () => void;
}

export default function AdminPanel(props: Props) {
  const onClose = useCallback(() => {
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  return (
    <Modal open={props.open} onClose={onClose}>
      <Container>
        <h1>Admin Controls</h1>
      </Container>
    </Modal>
  );
}
