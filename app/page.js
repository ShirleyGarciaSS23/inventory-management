'use client' // Ensure the component is rendered on the client side

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Alert } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#FFFFFF',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredInventory, setFilteredInventory] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [itemName, setItemName] = useState('')
  const [editItemName, setEditItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
    } catch (error) {
      setError("Error fetching inventory")
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    setFilteredInventory(
      inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [searchQuery, inventory])

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
      } else {
        await setDoc(docRef, { quantity: 1 })
      }
      setSuccess("Item added successfully")
      setItemName('')
      handleCloseAdd()
      await updateInventory()
    } catch (error) {
      setError("Error adding item")
    }
  }

  const updateItemQuantity = async () => {
    try {
      if (editItemName && quantity.trim() && !isNaN(quantity) && parseInt(quantity) > 0) {
        const docRef = doc(collection(firestore, 'inventory'), editItemName)
        await setDoc(docRef, { quantity: parseInt(quantity) }, { merge: true })
        setSuccess("Item quantity updated successfully")
        handleCloseEdit()
        await updateInventory()
      } else {
        setError("Please enter a valid quantity")
      }
    } catch (error) {
      setError("Error updating item quantity")
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
        }
        setSuccess("Item removed successfully")
      }
      await updateInventory()
    } catch (error) {
      setError("Error removing item")
    }
  }

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => {
    setOpenAdd(false)
    setItemName('')
    setError(null)
    setSuccess(null)
  }

  const handleOpenEdit = (item) => {
    setEditItemName(item.name)
    setQuantity(item.quantity.toString())
    setOpenEdit(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseEdit = () => {
    setOpenEdit(false)
    setEditItemName('')
    setQuantity('')
    setError(null)
    setSuccess(null)
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        bgcolor: '#FFFFFF',
        overflowY: 'auto', // Enable vertical scrolling
        p: 2, // Add some padding
      }}
    >
      {error && <Alert severity="error" sx={{ width: '50%' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ width: '50%' }}>{success}</Alert>}

      {/* Search Field */}
      <TextField
        id="search-field"
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2, maxWidth: '800px' }}
      />

      {/* Add Item Modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-add-title"
        aria-describedby="modal-add-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-add-title" variant="h6" component="h2" color="#3F5277" fontWeight="bold">
            Add Item
          </Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                if (itemName.trim()) {
                  addItem(itemName)
                } else {
                  setError("Item name cannot be empty")
                }
              }}
              sx={{ bgcolor: '#3F5277', color: 'white' }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-edit-title"
        aria-describedby="modal-edit-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-edit-title" variant="h6" component="h2" color="#3F5277" fontWeight="bold">
            Update Item Quantity
          </Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={updateItemQuantity}
              sx={{ bgcolor: '#008000', color: 'white' }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box
        sx={{
          width: '80%',
          maxWidth: '800px',
          bgcolor: '#F4C2C2',
          borderRadius: 4,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          maxHeight: 'calc(100vh - 200px)', // Adjust as needed
          overflowY: 'auto', // Enable vertical scrolling within this box
          p: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: '#3F5277',
            p: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" color="white" fontWeight="bold">
            Inventory Management
          </Typography>
        </Box>
        <Stack spacing={2} p={3}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h6" color="#3F5277" fontWeight="bold">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body1" color="#3F5277">
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenEdit({ name, quantity })}
                  sx={{ bgcolor: '#008000', color: 'white' }} // Updated to green
                >
                  Update
                </Button>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                  sx={{ bgcolor: '#FF0000', color: 'white' }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button
        variant="contained"
        onClick={handleOpenAdd}
        sx={{
          mt: 2,
          bgcolor: '#3F5277',
          color: 'white',
          borderRadius: 4,
          p: 1.5,
        }}
      >
        Add New Item
      </Button>
    </Box>
  )
}
