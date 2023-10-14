import React, { useEffect, useState } from "react";
import {
  TablePagination,
  TableFooter,
  CircularProgress,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  TextField,
  IconButton,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SuperheroModal from './SuperheroModal'
import {API, graphqlOperation} from 'aws-amplify'

import { deleteSuperheroDB } from '../../graphql';
//import { deleteRule, insertRule } from "../../api/CosmosApi";

const classes = {
  infoMessage: {
    marginTop: "37.5vh",
    textAlign: "center",
  },
  infoIcon: {
    color: "grey",
  },
  searchBar: {
    marginTop: "3%",
    marginLeft: "3%",
    width: "30%",
  },
  TextArea: {
    marginBottom: "30px",
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#000000",
    },
  },
  tableSpace: {
    width: "94%",
    height: "77%",
    marginLeft: "3%",
  },
  tableCellDesign: {
    textOverflow:'ellipsis', overflow:'hidden', maxWidth:'200px', whiteSpace:'nowrap',
    // width:'200%',
  },
  tableCellIconDesign: {
    padding: '0 0 0 -4px'
  }
}

const SuperheroTable = (props) => {
  const [list, setList] = useState(props.superheros || [])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(9);
  const [searchFilter, setSearchFilter] = React.useState('name');
  const [superheroModal, setSuperheroModal] = useState({
    isOpen: false,
    superhero:[]
  })
  useEffect(()=>{
    if(filter.trim()!='')
    {
      if(searchFilter =='name')
      {
        let newList = props.superheros.filter(n=>n.name.toUpperCase().includes(filter.toUpperCase()))    // Case-insensitive Search
        setList(newList)
      }
      else
      {
        let newList = []
        props.superheros.forEach(item=>{
          item.powers.forEach(pow=>{
            if(pow.label.toLowerCase().includes(filter.toLowerCase()))
            {
              newList.push(item)
            }
            setList(newList)
          })
        })
      }
    }
    else
    {
      setList(props.superheros)
    }
  },[filter, props.superheros])

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, list.length - page * rowsPerPage);
  
  const getHighlightedText = (text, highlight) => {
      // Split on highlight term and include term into parts, ignore case
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return <span> { parts.map((part, i) => 
          <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: 'bold' } : {} }>
              { part }
          </span>)
      } </span>;
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const CommaSeperatedCategories = (categories) => {
    let ls = ''
    categories.map((item, index)=>{
      if(index!=categories.length-1)
      {
        ls = ls+item.label+','
      }
      else
      {
        ls = ls+item.label
      }
    })
    return ls;
  }
  
  const editHero = (index, row) => {
    props.setAction('edit')
    props.setSelectedSuperhero(row)
  }

  const deleteCurrentHero= async(index,row) => {
    // Delete from DYnamo DB. If deleted, remove entry from UI
    console.log('calling delete function in appsync')
    const superheroDetails = {
      id: row.id,
    } 
    const isDeleted = await API.graphql({
      query: deleteSuperheroDB,
      variables: { input: superheroDetails },
      authMode: "API_KEY"
    })
      console.log('deleted superheroes List:', isDeleted)
      if(isDeleted.hasOwnProperty('data'))
      {
        setLoading(true)
    let newList = props.superheros.filter(n=>n.id!=row.id)
    props.setSuperheros(newList)
    setLoading(false)
      }
    // setLoading(true)
    // const flag = await deleteRule(row)
    // if(flag.statusCode == 204)
    // {
    //   let newRules = props.rules.filter(n=>n.id!==row.id)
    //   props.setRules(newRules)
    //   console.log('Deleted rule from DB')
    //   setLoading(false)
    //   // If rule is opened in Rule form for editing and user clicks on delete button in RulesList Table, then reset Rule Form
    //   if(props.selectedRule && props.selectedRule.id == row.id)
    //   {
    //     props.resetRuleForm()
    //   }
    // }
  }
  
  function addAfter(array, index, newItem) {
    return [
        ...array.slice(0, index),
        newItem,
        ...array.slice(index)
    ];
}

  const changeSearchType = (newVal) => {
    setSearchFilter(newVal)
    setFilter('')
  }

  const openHero = async(row, index) => {
    setSuperheroModal({
      isOpen: true,
      superheroName: row.name,
      superheroPowers: CommaSeperatedCategories(row.powers),
      superheroBackstory: row.backstory
    })
  } 
  
  return (
    <>
      {
         (props.superheros && props.superheros.length == 0)?(
             <div style={{marginTop: "37.5vh",textAlign: "center"}}>
             <InfoIcon sx={classes.infoIcon}/>
             <div>
                 No superheros have been added
             </div>
             </div>
         ):loading?(<div style={{marginTop: "37.5vh",textAlign: "center"}}>
          <CircularProgress sx={classes.infoIcon}/>
          <div>
              Please wait while we delete this superhero from database ..
          </div>
          </div>
         ):(
        <>
          <div style= {{marginTop: "3%", marginLeft: "3%", display:'flex'}}>
            <TextField
              id="outlined-basic"
              label="search my superhero"
              variant="outlined"
              autoComplete="off"
              sx={classes.TextArea}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <ToggleButtonGroup
            exclusive
              value={searchFilter}
              onChange={(e, newVal)=>changeSearchType(newVal)}
              aria-label="text formatting"
              style={{marginLeft:'3%', height: '56px'}}
            >
              <ToggleButton value="name" aria-label="bold">
              <b>Search by Name</b>
              </ToggleButton>
              <ToggleButton value="powers" aria-label="bold">
                <b>Search by powers</b>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div style={{
            width: "94%",
            height: "77%",
            marginLeft: "3%"
          }}>
            <Table
              sx={classes.table}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell classes={{body:classes.tableCellDesign}} align="left">
                    <b>Name</b>
                  </TableCell>
                  <TableCell classes={{body:classes.tableCellDesign}} align="left">
                    <b>Powers</b>
                  </TableCell>
                  <TableCell classes={{body:classes.tableCellDesign}} align="left">
                    <b>Backstory</b>
                  </TableCell>
                  <TableCell classes={{body:classes.tableCellDesign}} align="right">
                    <b>Open</b>
                  </TableCell>
                  <TableCell classes={{body:classes.tableCellDesign}} align="right">
                    <b>Edit&nbsp;&nbsp;&nbsp;</b>
                  </TableCell>
                  <TableCell classes={{body:classes.tableCellDesign}} align="right">
                    <b>Delete</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  (rowsPerPage > 0
                    ? list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : list
                  ).map((row, index) => {
                  return(
                  <TableRow key={row.id}>
                    <TableCell component="th" classes={{body:classes.tableCellDesign}}>
                      {getHighlightedText(row.name,filter)}
                    </TableCell>
                    <TableCell align="left" classes={{body:classes.tableCellDesign}} ><div style={classes.tableCellDesign}>{getHighlightedText(CommaSeperatedCategories(row.powers),filter)}</div></TableCell>
                    <TableCell align="left" classes={{body:classes.tableCellDesign}} ><div style={classes.tableCellDesign}>{row.backstory}</div></TableCell>
                    <TableCell align="right" classes={{body:classes.tableCellIconDesign}} >
                    <IconButton
                        aria-label="Open Hero"
                        onClick={() => openHero(row, index)}
                      >
                      <OpenInNewSharpIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right" classes={{body:classes.tableCellIconDesign}} >
                      <IconButton
                        aria-label="Edit Hero"
                        onClick={() => editHero(index, row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="Delete Hero"
                        onClick={() => deleteCurrentHero(index,row)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )})}
                {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={12} />
                </TableRow>
              )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[9, 18, 27, { label: 'All', value: -1 }]}
                    colSpan={12}
                    count={list.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: { 'aria-label': 'rows per page' },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <SuperheroModal open={superheroModal.isOpen} setOpen={setSuperheroModal} superheroName={superheroModal.superheroName} superheroPowers={superheroModal.superheroPowers} superheroBackstory={superheroModal.superheroBackstory} />
        </>
         )
      }
    </>
  );
};

export default SuperheroTable;