import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import editFill from '@iconify/icons-eva/edit-fill';
import PropTypes from 'prop-types';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import axios from 'axios';
// material
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';

// ----------------------------------------------------------------------

UserMoreMenu.propTypes = {
  poolAddress: PropTypes.string,
  setGameitems: PropTypes.func
};

export default function UserMoreMenu(props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const delItem = (poolAddress) => {
    axios.post(process.env.REACT_APP_SERVER + '/api/admin/deleteGame', { poolAddress: poolAddress }).then((res) => {
      props.setGameitems(res);
      setIsOpen(false);
    });
  };

  const acceptItem = (poolAddress) => {
    console.log(poolAddress);
    axios.post(process.env.REACT_APP_SERVER + '/api/admin/acceptitem', { poolAddress: poolAddress, approve: true }).then((res) => {
      props.setGameitems(res);
      setIsOpen(false);
    });
  };

  const rejectItem = (poolAddress) => {
    axios.post(process.env.REACT_APP_SERVER + '/api/admin/acceptitem', { poolAddress: poolAddress, approve: false }).then((res) => {
      props.setGameitems(res);
      setIsOpen(false);
    });
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' }
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            acceptItem(props.poolAddress);
          }}
        >
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Accept" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => {
            rejectItem(props.poolAddress);
          }}
        >
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Reject" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
    </>
  );
}
