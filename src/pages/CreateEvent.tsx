import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Image, Plus, Trash2, DollarSign } from 'lucide-react'
import { useEventContract } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

interface TicketTierForm {
  name: string
  price: string
  maxSupply: number
  maxPerWallet: number
  description: string
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWeb3()
  const { createEvent, createTicketTier, loading } = useEventContract()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUri: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  })

  const [ticketTiers, setTicketTiers] = useState<TicketTierForm[]>([
    {
      name: 'General Admission',
      price: '0.01',
      maxSupply: 100,
      maxPerWallet: 5,
      description: 'Standard event access'
    }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTierChange = (index: number, field: keyof TicketTierForm, value: string | number) => {
    setTicketTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ))
  }

  const addTier = () => {
    setTicketTiers(prev => [...prev, {
      name: '',
      price: '0.01',
      maxSupply: 50,
      maxPerWallet: 3,
      description: ''
    }])
  }

  const removeTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      await connectWallet()
      return
    }

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
        toast.error('Please fill in all required fields')
        return
      }

      // Create start and end dates
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime || '23:59'}`)

      if (startDateTime >= endDateTime) {
        toast.error('End date must be after start date')
        return
      }

      if (startDateTime <= new Date()) {
        toast.error('Start date must be in the future')
        return
      }

      // Use a default image if none provided
      const imageUri = formData.imageUri || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`

      // Create the event
      const { eventId } = await createEvent(
        formData.name,
        formData.description,
        imageUri,
        startDateTime,
        endDateTime
      )

      // Create ticket tiers
      for (const tier of ticketTiers) {
        if (tier.name && tier.price) {
          await createTicketTier(
            eventId,
            tier.name,
            tier.price,
            tier.maxSupply,
            tier.maxPerWallet,
            `https://api.example.com/metadata/${eventId}/${tier.name.toLowerCase().replace(/\s+/g, '-')}`
          )
        }
      }

      toast.success('Event created successfully!')
      navigate(`/events/${eventId}`)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-purple-200 mb-6">
                Connect your wallet to create and manage events on the blockchain.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create New Event</h1>
            <p className="text-xl text-purple-200">
              Launch your event on the blockchain with NFT tickets
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-2">
                    <Image className="inline w-5 h-5 mr-2" />
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUri"
                    value={formData.imageUri}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg (optional - default will be used)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Clock className="inline w-5 h-5 mr-2" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    <Clock className="inline w-5 h-5 mr-2" />
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Ticket Tiers</h2>
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </button>
              </div>

              <div className="space-y-6">
                {ticketTiers.map((tier, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Tier {index + 1}</h3>
                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-semibold mb-2">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          placeholder="e.g., VIP, General Admission"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">
                          <DollarSign className="inline w-4 h-4 mr-1" />
                          Price (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                          placeholder="0.01"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">Max Supply</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxSupply}
                          onChange={(e) => handleTierChange(index, 'maxSupply', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">Max Per Wallet</label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxPerWallet}
                          onChange={(e) => handleTierChange(index, 'maxPerWallet', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-xl font-semibold text-white transition-all ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Event...
                  </div>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent
