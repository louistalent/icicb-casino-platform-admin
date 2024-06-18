import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import axios from 'axios';
// material
import {
  Card,
  Table,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TableContainer,
  TablePagination
} from '@mui/material';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'game_img_src', label: 'Image', alignRight: false },
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'frontendurl', label: 'Frontend URL', alignRight: false },
  { id: 'backendurl', label: 'Backend URL', alignRight: false },
  { id: 'balance', label: 'Balance', alignRight: false },
  { id: 'approve_flag', label: 'Status', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Game() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [games, setGames] = useState([]);

  useEffect(() => {
    axios.post(process.env.REACT_APP_SERVER + '/api/games/getgamelist').then((res) => {
      if(res.data.games) setGames(res.data.games);
    });
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = games?games.map((n) => n.name):[];
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected?selected.indexOf(name):-1;
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const setGameitems = (res) => {
    setGames(res.data.games);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - games.length) : 0;

  const filteredGames = applySortFilter(games, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredGames.length === 0;

  return (
    <Page title="Gamelist">
      <Container>
        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={games.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredGames
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const isItemSelected = selected.indexOf(row.name) !== -1;
                      return (
                        <TableRow
                          hover
                          key={row._id}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, row.name)}
                            />
                          </TableCell>
                          <TableCell component="th" padding="none" align="left" width="50">
                            <img src={row.game_img_src} alt="gameimg" />
                          </TableCell>
                          <TableCell align="left">{row.name}</TableCell>
                          <TableCell align="left">
                            {row.description.length > 50
                              ? row.description.substring(0, 50) + String(' ...')
                              : row.description}
                          </TableCell>
                          <TableCell align="left">{row.frontendurl}</TableCell>
                          <TableCell align="left">{row.backendurl}</TableCell>
                          <TableCell align="left">{row.balance}</TableCell>
                          <TableCell align="left">
                            <Label variant="ghost" color={row.approve_flag ? 'success' : 'error'}>
                              {row.approve_flag ? 'Accepted' : 'pending'}
                            </Label>
                          </TableCell>

                          <TableCell align="right">
                            <UserMoreMenu poolAddress={row.poolAddress} setGameitems={setGameitems} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={games.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
