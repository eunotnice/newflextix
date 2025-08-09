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
  const { createEvent, createTicketTier, createBlindBagReward, loading } = useEventContract()

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

  type StickerForm = { name: string; imageUri: string; percentage: number }
  const [stickers, setStickers] = useState<StickerForm[]>([
    { name: '', imageUri: '', percentage: 50 },
    { name: '', imageUri: '', percentage: 50 }
  ]);

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

      // Validate stickers: must have at least 2; each 1..99; sum percentages to exactly 100
      const cleanedStickers = stickers
        .map(s => ({ name: s.name.trim(), imageUri: s.imageUri.trim(), percentage: Number(s.percentage) }))
        .filter(s => s.name && s.imageUri && !Number.isNaN(s.percentage))
      if (cleanedStickers.length < 2) {
        toast.error('Please add at least two stickers (name, image, percentage)')
        return
      }
      if (cleanedStickers.some(s => !Number.isInteger(s.percentage) || s.percentage < 1 || s.percentage > 99)) {
        toast.error('Each sticker percentage must be an integer between 1 and 99')
        return
      }
      const totalPct = cleanedStickers.reduce((sum, s) => sum + s.percentage, 0)
      if (totalPct !== 100) {
        toast.error('Sticker percentages must add up to exactly 100')
        return
      }

      // Create the event with stickers included
      // Assuming your createEvent function accepts stickers as an argument
      const { eventId } = await createEvent(
        formData.name,
        formData.description,
        imageUri,
        startDateTime,
        endDateTime,
        cleanedStickers  // pass structured stickers
      )

      // Create stickers (blind bag rewards) on-chain
      for (const s of cleanedStickers) {
        await createBlindBagReward(eventId, s.name, s.imageUri, s.percentage)
      }

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
      toast.error('Failed to create event')
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

                  {/* Beautiful centered image preview */}
                  {formData.imageUri && (
                    <div className="flex justify-center mt-4">
                      <div className="relative w-64 h-40 rounded-xl overflow-hidden border-2 border-purple-600 shadow-lg bg-gradient-to-tr from-purple-700 via-purple-900 to-black">
                        <img
                          src={formData.imageUri}
                          alt="Event preview"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.display = 'block';
                          }}
                        />
                        {/* Optional overlay label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-purple-900 bg-opacity-60 text-white text-center py-1 text-sm font-medium select-none">
                          Preview
                        </div>
                      </div>
                    </div>
                  )}
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
                          type="text"
                          inputMode="decimal"          // numeric keyboard with decimal point on mobiles
                          value={tier.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Allow empty string OR a number with up to 2 decimals, no negative
                            if (
                              val === "" || 
                              /^(\d+)?(\.\d{0,2})?$/.test(val)
                            ) {
                              handleTierChange(index, 'price', val);
                            }
                          }}
                          placeholder="0.01"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">Max Supply</label>
                        <input
                          type="text"              // changed from number to text
                          inputMode="numeric"      // numeric keyboard on mobile
                          value={tier.maxSupply}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {   // allow only digits (empty allowed to delete)
                              // Prevent empty string going to 0 or 1? You can adjust here:
                              // For now, just pass the string value and parse later if needed
                              handleTierChange(index, 'maxSupply', val);
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">Max Per Wallet</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.maxPerWallet}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              handleTierChange(index, 'maxPerWallet', val);
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Stickers (min 2)</h2>
                <button
                  type="button"
                  onClick={() => setStickers(prev => [...prev, { name: '', imageUri: '', percentage: 1 }])}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Sticker
                </button>
              </div>

              <p className="text-purple-200 text-sm mb-4">Percentages are used for future lucky draw odds. Each must be 1–99 and total must equal 100.</p>

              <div className="space-y-4">
                {stickers.map((s, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="md:col-span-4">
                      <label className="block text-white font-semibold mb-2">Name</label>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => setStickers(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                        placeholder="e.g., Gold Badge"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-white font-semibold mb-2">Image URL</label>
                      <input
                        type="url"
                        value={s.imageUri}
                        onChange={(e) => setStickers(prev => prev.map((x, idx) => idx === i ? { ...x, imageUri: e.target.value } : x))}
                        placeholder="https://example.com/sticker.png"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white font-semibold mb-2">Percentage</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        step={1}
                        value={s.percentage}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          if (!Number.isNaN(val) && val >= 1 && val <= 99) {
                            setStickers(prev => prev.map((x, idx) => idx === i ? { ...x, percentage: val } : x))
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-12 flex justify-end">
                      {stickers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setStickers(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total percentage indicator */}
              <div className="mt-4 text-right">
                {(() => {
                  const total = stickers.reduce((sum, s) => sum + Number(s.percentage || 0), 0)
                  const ok = total === 100
                  return (
                    <span className={`text-sm font-semibold ${ok ? 'text-green-300' : 'text-red-300'}`}>
                      Total: {total}% {ok ? '' : '(must equal 100%)'}
                    </span>
                  )
                })()}
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