import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, ExternalLink, Star, ArrowLeft } from 'lucide-react';
import { useEventContract } from '../hooks/useEventContract';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';


interface TicketDetails {
    tokenId: number;
    eventId: number;
    tierId: number;
    owner: string;
    isUsed: boolean;
    purchaseTime: number;
    event?: {

        eventId: number;

        name: string;
        description: string;
        imageUri: string;
        startTime: number;
        endTime: number;
        organizer: string;

        isActive?: boolean;
        hasEnded?: boolean;

    };
    tier?: {
        name: string;
        price: bigint;
    };
}

const TicketDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    console.log('TicketDetails component loaded with id:', id);

    const navigate = useNavigate();

    const { isConnected, account, chainId } = useWeb3();
    const { getTicket, getEvent, getTicketTier, hasClaimedBlindBag, claimBlindBag, getEventRewardsDetails, getReward, contract, loading: contractLoading } = useEventContract();


    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrOpen, setQrOpen] = useState(false);
    const [hasClaimed, setHasClaimed] = useState<boolean>(false);
    const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
    const [claimResult, setClaimResult] = useState<{ txHash: string, rewardId?: number } | null>(null);
    const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'result'>('idle');
    const [rewards, setRewards] = useState<Array<{ rewardId: number; name: string; metadataUri: string; rarity: number }>>([]);
    const [selectedReward, setSelectedReward] = useState<{ rewardId: number; name: string; metadataUri: string; rarity: number } | null>(null);
    const fetchInProgressRef = useRef(false);
    const lastFetchedIdRef = useRef<string | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchTicketData = async () => {
            // Wait for contract to be ready
            if (contractLoading || !contract) {
                console.log('⏳ Contract not ready yet. Waiting to fetch ticket...');
                return;
            }

            if (!id) {
                toast.error('Invalid ticket ID');
                navigate('/my-tickets');
                return;
            }

            // Prevent duplicate fetches
            const fetchingRef = fetchInProgressRef;
            const lastIdRef = lastFetchedIdRef;
            if (fetchingRef.current) {
                return;
            }
            if (lastIdRef.current === id && ticket) {
                return;
            }

            try {
                setLoading(true);
                fetchingRef.current = true;
                const ticketId = parseInt(id);

                // Fetch basic ticket info
                const ticketData = await getTicket(ticketId);
                console.log('Raw ticketData from contract:', ticketData);
                if (!ticketData) {
                    toast.error('Ticket not found');
                    navigate('/my-tickets');
                    return;
                }


                // Fetch additional event and tier info
                const [eventData, tierData] = await Promise.all([
                    getEvent(ticketData.eventId),
                    getTicketTier(ticketData.tierId)
                ]);

                const composedTicket = {
                    ...ticketData,
                    event: eventData || undefined,
                    tier: tierData || undefined
                } as TicketDetails;
                setTicket(composedTicket);

                // Determine lucky draw claimed status when event present
                if (account && composedTicket.event) {
                    try {
                        const claimed = await hasClaimedBlindBag(account, composedTicket.event.eventId);
                        setHasClaimed(claimed);
                        const evRewards = await getEventRewardsDetails(composedTicket.event.eventId);
                        setRewards(evRewards);
                    } catch (e) {
                        console.warn('Unable to check lucky draw claim status');
                    }
                }

            } catch (error) {
                console.error('Error fetching ticket data:', error);
                toast.error('Failed to load ticket details');
                navigate('/my-tickets');
            } finally {
                setLoading(false);
                fetchInProgressRef.current = false;
                lastFetchedIdRef.current = id ?? null;
            }
        };

        fetchTicketData();
    }, [id, contract, contractLoading, account]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNetworkName = (id: number | null | undefined) => {
        switch (id) {
            case 31337: return 'Hardhat Local';
            case 1: return 'Ethereum Mainnet';
            case 11155111: return 'Sepolia';
            case 5: return 'Goerli';
            case 137: return 'Polygon';
            case 80001: return 'Mumbai';
            case 56: return 'BSC';
            case 97: return 'BSC Testnet';
            case 10: return 'Optimism';
            case 42161: return 'Arbitrum One';
            case 8453: return 'Base';
            case 84532: return 'Base Sepolia';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h1>
                        <button
                            onClick={() => navigate('/my-tickets')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors"
                        >
                            Back to My Tickets
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/my-tickets')}
                    className="flex items-center text-purple-300 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to My Tickets
                </button>

                {/* Ticket Card */}
                <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {ticket.event?.name || 'Unknown Event'}
                                </h1>
                                <p className="text-purple-100">
                                    {ticket.tier?.name || 'General Admission'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                                        Ticket #{ticket.tokenId}
                                    </span>
                                </div>
                                {/* Lucky Draw action */}
                                {(() => {
                                    if (!ticket.event) return null;
                                    const nowSec = Math.floor(Date.now() / 1000);
                                    const isEventOver = Boolean(ticket.event.hasEnded) || nowSec >= ticket.event.endTime;
                                    if (!isEventOver) return null;
                                    return (
                                        <button
                                            disabled={hasClaimed}
                                            onClick={() => setClaimModalOpen(true)}
                                            className={`inline-block px-3 py-1 rounded text-xs font-semibold ${hasClaimed ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'}`}
                                        >
                                            {hasClaimed ? 'Drawed' : 'Claim Lucky Draw'}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-6">
                        {/* Event Image with sticker overlay */}
                        {ticket.event?.imageUri && (
                            <div className="mb-6 rounded-lg overflow-hidden relative">
                                <img
                                    src={ticket.event.imageUri}
                                    alt={ticket.event.name}
                                    className="w-full h-48 object-cover"
                                />
                                {selectedReward?.metadataUri && (
                                    <img
                                        src={selectedReward.metadataUri}
                                        alt={selectedReward.name}
                                        className="absolute top-2 right-2 w-14 h-14 rounded-lg shadow-lg border-2 border-yellow-300"
                                        title={selectedReward.name}
                                    />
                                )}
                            </div>
                        )}

                        {/* Ticket Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-start text-purple-200">
                                <Calendar className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">Event Date</div>
                                    <div className="text-sm">
                                        {ticket.event ? formatDate(ticket.event.startTime) : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start text-purple-200">
                                <Clock className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">Purchased</div>
                                    <div className="text-sm">{formatDate(ticket.purchaseTime)}</div>
                                </div>
                            </div>

                            <div className="flex items-start text-purple-200">
                                <Calendar className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">End Date</div>
                                    <div className="text-sm">
                                        {ticket.event ? formatDate(ticket.event.endTime) : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start text-purple-200">
                                <ExternalLink className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">Ticket ID</div>
                                    <div className="text-sm font-mono">#{ticket.tokenId}</div>
                                </div>
                            </div>

                            <div className="flex items-start text-purple-200">
                                <Ticket className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">Status</div>
                                    <div className="text-sm flex items-center">
                                        {ticket.isUsed ? (
                                            <>
                                                <Star className="w-4 h-4 mr-1 text-green-400" />
                                                <span>Used</span>
                                            </>
                                        ) : (
                                            <>
                                                <Ticket className="w-4 h-4 mr-1 text-blue-400" />
                                                <span>Valid</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start text-purple-200">
                                <ExternalLink className="w-5 h-5 mr-3 mt-1" />
                                <div>
                                    <div className="font-semibold">Blockchain</div>
                                    <div className="text-sm">{getNetworkName(chainId)}{chainId ? ` (Chain ID: ${chainId})` : ''}</div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="border-t border-white/20 pt-4 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Ticket Owner</h3>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mr-3">
                                    {account?.slice(2, 4).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white font-mono">
                                        {account?.slice(0, 6)}...{account?.slice(-4)}
                                    </div>
                                    <div className="text-purple-300 text-sm">
                                        {account === ticket.owner ? 'You' : 'Another wallet'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Button */}
                        <button
                            onClick={() => setQrOpen(true)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            Show QR Code
                        </button>
                    </div>
                </div>

                {/* QR Code Modal */}
                {qrOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 shadow-lg text-center relative max-w-sm w-full">
                            <h2 className="text-xl font-bold mb-4 text-purple-700">Ticket QR Code</h2>
                            <div className="flex justify-center mb-6">
                                <QRCodeSVG
                                    value={JSON.stringify({
                                        tokenId: ticket.tokenId,
                                        eventId: ticket.eventId,
                                        owner: ticket.owner,
                                        timestamp: Date.now()
                                    })}
                                    size={200}
                                />
                            </div>
                            <p className="text-gray-600 mb-4">Scan this code at the event entrance</p>
                            <button
                                onClick={() => setQrOpen(false)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Claim Lucky Draw Modal */}
                {claimModalOpen && ticket?.event && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 shadow-lg relative max-w-md w-full">
                            <h2 className="text-xl font-bold mb-3 text-purple-700">Confirm Lucky Draw</h2>
                            {!claimResult ? (
                                <>
                                    {spinPhase === 'spinning' ? (
                                        <div className="flex flex-col items-center mb-4">
                                            <div className="w-40 h-40 rounded-full border-8 border-yellow-300 border-t-transparent animate-spin"></div>
                                            <p className="mt-4 text-purple-800 font-semibold">Spinning...</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 mb-4">
                                            You have one chance to join the lucky draw for this event. Continue?
                                        </p>
                                    )}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            onClick={() => setClaimModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-lg bg-yellow-400 text-purple-900 font-semibold hover:bg-yellow-300"
                                            onClick={async () => {
                                                if (!ticket?.event) return
                                                try {
                                                    setSpinPhase('spinning')
                                                    // Artificial spin delay to show wheel
                                                    await new Promise(res => setTimeout(res, 2000))

                                                    const claimedNow = await hasClaimedBlindBag(account!, ticket.event.eventId)
                                                    if (claimedNow) {
                                                        setHasClaimed(true)
                                                        toast.error('Already claimed the lucky draw for this event')
                                                        setSpinPhase('idle')
                                                        return
                                                    }
                                                    const result = await claimBlindBag(ticket.event.eventId)
                                                    setClaimResult(result)
                                                    setHasClaimed(true)

                                                    if (typeof result.rewardId === 'number') {
                                                        const reward = await getReward(result.rewardId)
                                                        if (reward) setSelectedReward(reward)
                                                    }
                                                    setSpinPhase('result')
                                                } catch (e: any) {
                                                    console.error(e)
                                                    setSpinPhase('idle')
                                                }
                                            }}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-purple-800">Lucky Draw Result</h3>
                                        {spinPhase === 'result' && selectedReward ? (
                                            <div className="flex flex-col items-center">
                                                <img src={selectedReward.metadataUri} alt={selectedReward.name} className="w-28 h-28 object-cover rounded-lg mb-2" />
                                                <p className="text-gray-700 font-semibold">{selectedReward.name}</p>
                                                <p className="text-gray-600 text-sm">Reward ID: <span className="font-mono">{selectedReward.rewardId}</span></p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700">Claimed successfully. Check your rewards.</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">Tx: <span className="font-mono">{claimResult.txHash.slice(0, 10)}...{claimResult.txHash.slice(-8)}</span></p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                                            onClick={() => setClaimModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;