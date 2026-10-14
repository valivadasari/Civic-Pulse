import { CivicIssue } from '../types/issue';

export const INITIAL_DEMO_ISSUES: CivicIssue[] = [
  {
    id: 'CP-1001',
    title: 'Severe Pothole on Market & 5th Ave',
    description: 'Deep 3-foot wide asphalt crater right in the middle traffic lane. Multiple cars have sustained rim damage and drivers are swerving into oncoming traffic.',
    category: 'Pothole',
    priority: 'High',
    status: 'Open',
    location: {
      lat: 37.7833,
      lng: -122.4089,
      address: '845 Market St, Downtown',
      neighborhood: 'Downtown Core'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'Marcus Vance',
    upvotes: 14,
    aiAnalysis: {
      likelyCategory: 'Pothole',
      summary: 'Severe road surface breakdown posing severe vehicular damage and accident risk.',
      recommendedPriority: 'High',
      reasoning: 'Located on high-throughput arterial thoroughfare. Depth exceeds 3.5 inches with sharp fractured edges, creating sudden hazard for cyclists and passenger cars.',
      nextAction: 'Dispatch rapid response cold-patch asphalt crew. Install high-visibility reflective warning pylons immediately.',
      confidence: 0.96,
      hazardScore: 9,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      detectedFeatures: ['deep asphalt cavitation', 'sub-base exposure', 'active traffic zone', 'fragmented debris']
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Report logged by citizen and confirmed by AI vision.' }
    ]
  },
  {
    id: 'CP-1002',
    title: 'Overflowing Commercial Dumpster & Sidewalk Spill',
    description: 'Commercial waste bins overflowing into the public walkway. Cardboard, food waste, and plastic bags are scattering, attracting rodents and blocking wheelchair access.',
    category: 'Garbage',
    priority: 'Medium',
    status: 'In Progress',
    location: {
      lat: 37.7891,
      lng: -122.4014,
      address: '220 Montgomery St, Financial District',
      neighborhood: 'Financial District'
    },
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'Elena Rostova',
    upvotes: 8,
    aiAnalysis: {
      likelyCategory: 'Garbage',
      summary: 'Bio-sanitation hazard and sidewalk obstruction due to uncollected waste.',
      recommendedPriority: 'Medium',
      reasoning: 'Non-toxic organic and recyclable waste spillage encroaching on ADA sidewalk corridor. Moderate pest vector risk.',
      nextAction: 'Notify Department of Public Works sanitation team. Issue formal citation to adjoining commercial premise.',
      confidence: 0.92,
      hazardScore: 6,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      detectedFeatures: ['solid waste overload', 'pedestrian clearance obstruction', 'organic refuse leakage']
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Report logged.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Sanitation truck #14 assigned for morning pickup.' }
    ]
  },
  {
    id: 'CP-1003',
    title: 'Blocked Stormwater Grate & Localized Road Flooding',
    description: 'Storm drain intake completely clogged with compressed autumn leaves, twigs, and plastic bottles. Rainwater has backed up 6 inches deep across two lanes.',
    category: 'Blocked Drain',
    priority: 'High',
    status: 'Open',
    location: {
      lat: 37.7765,
      lng: -122.4172,
      address: '1400 Mission St, SOMA',
      neighborhood: 'SOMA'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'Devon Clarke',
    upvotes: 19,
    aiAnalysis: {
      likelyCategory: 'Blocked Drain',
      summary: 'Storm drain obstruction creating standing water ponding and hydroplaning danger.',
      recommendedPriority: 'High',
      reasoning: 'Surface runoff inability to discharge. High risk of water intrusion into ground-floor storefronts and vehicular loss of traction.',
      nextAction: 'Deploy vacuum jetting utility truck and manual rake crew to clear curb inlet.',
      confidence: 0.94,
      hazardScore: 8,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      detectedFeatures: ['grate leaf compaction', 'curb overflow', 'standing runoff water', 'debris blanket']
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), note: 'Citizens flagged rapid standing water rise.' }
    ]
  },
  {
    id: 'CP-1004',
    title: 'Pressurized Municipal Water Main Leak',
    description: 'Clean drinking water gushing up through sidewalk seam near fire hydrant. Constant water flow running 50 yards down the street for over 12 hours.',
    category: 'Water Leakage',
    priority: 'High',
    status: 'In Progress',
    location: {
      lat: 37.7689,
      lng: -122.4285,
      address: '520 Castro St, Castro',
      neighborhood: 'Castro'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'Sophia Lin',
    upvotes: 23,
    aiAnalysis: {
      likelyCategory: 'Water Leakage',
      summary: 'Sub-surface pressurized pipe breach causing continuous potable water loss and soil erosion.',
      recommendedPriority: 'High',
      reasoning: 'Significant water loss rate estimated >25 gallons/min. Danger of sub-base erosion leading to sinkhole formation underneath sidewalk slab.',
      nextAction: 'Alert Water District dispatch to shut off local isolating valve and conduct emergency pipe sleeve clamp repair.',
      confidence: 0.97,
      hazardScore: 9,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      detectedFeatures: ['pressurized geyser', 'sidewalk fissure', 'pavement saturation', 'continuous flow']
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Initial leak detected.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Water utility crew on scene; valve isolation in progress.' }
    ]
  },
  {
    id: 'CP-1005',
    title: 'Damaged Crosswalk Pedestrian Signal & Loose Bollard',
    description: 'Pedestrian push button housing is cracked and hanging by electrical wires. Adjacent yellow protective steel bollard was hit by delivery truck and is tilted 45 degrees.',
    category: 'Other',
    priority: 'Medium',
    status: 'Resolved',
    location: {
      lat: 37.7812,
      lng: -122.3998,
      address: '350 2nd St, South Beach',
      neighborhood: 'South Beach'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'Carlos Mendoza',
    upvotes: 7,
    aiAnalysis: {
      likelyCategory: 'Other',
      summary: 'Damaged traffic control interface and weakened perimeter bollard protection.',
      recommendedPriority: 'Medium',
      reasoning: 'Compromised pedestrian assistive audio/button hardware. Low voltage wiring exposed. Bollard integrity degraded.',
      nextAction: 'Dispatch electrical signaling technician to replace button faceplate and re-anchor bollard flange.',
      confidence: 0.89,
      hazardScore: 5,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      detectedFeatures: ['exposed pedestrian control wiring', 'bent bollard', 'impact scuffs']
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Report logged.' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), note: 'Technician dispatched.' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), note: 'Replaced button console and realigned bollard with fresh quickset concrete.' }
    ]
  },
  {
    id: 'CP-1006',
    title: 'Repaired Pothole on Pine & Mason',
    description: 'Former deep depression on bus route. Successfully filled and steam-rolled by municipal highway squad.',
    category: 'Pothole',
    priority: 'Low',
    status: 'Resolved',
    location: {
      lat: 37.7915,
      lng: -122.4112,
      address: '720 Pine St, Nob Hill',
      neighborhood: 'Nob Hill'
    },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    isDemo: true,
    reporterName: 'City Inspector Briggs',
    upvotes: 11,
    aiAnalysis: {
      likelyCategory: 'Pothole',
      summary: 'Surface restored to grade with hot-mix asphalt sealant.',
      recommendedPriority: 'Low',
      reasoning: 'Smooth transition with adjacent lane. Sealed perimeter preventing winter freeze-thaw degradation.',
      nextAction: 'Monitor during next rain cycle for edge subsidence.',
      confidence: 0.95,
      hazardScore: 1,
      isSimulated: false,
      analyzedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    },
    statusHistory: [
      { status: 'Open', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), note: 'Reported by Muni bus driver.' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), note: 'Road maintenance completed.' }
    ]
  }
];

export const SAMPLE_PRESETS = [
  {
    name: 'Dangerous Pothole on High-Speed Road',
    category: 'Pothole' as const,
    title: 'Dangerous 4-foot Pothole Near Intersection',
    description: 'Severe road cavity with exposed rebar in the right-turn lane. Multiple drivers having to brake abruptly to avoid suspension damage.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    address: '920 Howard St, SOMA',
    lat: 37.7818,
    lng: -122.4048
  },
  {
    name: 'Illegal Dumping & Rotting Trash Pile',
    category: 'Garbage' as const,
    title: 'Massive Waste Dump on Public Sidewalk',
    description: 'Piles of discarded mattresses, construction debris, and rotting household refuse blocking pedestrian right-of-way and creating strong odor.',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    address: '410 7th St, SOMA',
    lat: 37.7745,
    lng: -122.4072
  },
  {
    name: 'Completely Blocked Sewer Catch Basin',
    category: 'Blocked Drain' as const,
    title: 'Clogged Storm Inlet with Street Overflow',
    description: 'Silt, gravel, and trash bags have jammed the storm drain grating. Water is backing up past the curb and entering the parking lane.',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    address: '1150 Folsom St, SOMA',
    lat: 37.7772,
    lng: -122.4101
  },
  {
    name: 'Gushing Broken Water Pipe',
    category: 'Water Leakage' as const,
    title: 'High Pressure Water Jet Escaping Curb',
    description: 'Ruptured water service connection shooting a 3-foot stream of water onto the roadway. Substantial water waste and potential erosion risk.',
    imageUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    address: '380 Hayes St, Hayes Valley',
    lat: 37.7766,
    lng: -122.4241
  }
];
