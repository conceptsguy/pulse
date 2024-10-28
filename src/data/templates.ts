import { trades } from './trades';

export interface TaskTemplate {
  id: string;
  label: string;
  trade?: string;
  tradeColor?: string;
  description?: string;
  duration?: number;
  dependencies?: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: TaskTemplate[];
}

const findTrade = (tradeName: string) => trades.find(t => t.name === tradeName);

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'new-home-construction',
    name: 'New Home Construction',
    description: 'Complete residential construction sequence',
    category: 'Residential',
    tasks: [
      // Pre-Construction Phase
      {
        id: 'site-survey',
        label: 'Site Survey and Analysis',
        trade: 'Excavation',
        tradeColor: findTrade('Excavation')?.color,
        description: 'Survey property boundaries and analyze soil conditions',
        duration: 3
      },
      {
        id: 'permits',
        label: 'Obtain Building Permits',
        description: 'Submit and process all required building permits',
        duration: 15,
        dependencies: ['site-survey']
      },
      
      // Site Preparation
      {
        id: 'clear-site',
        label: 'Clear and Grade Site',
        trade: 'Excavation',
        tradeColor: findTrade('Excavation')?.color,
        description: 'Remove vegetation and grade for proper drainage',
        duration: 4,
        dependencies: ['permits']
      },
      {
        id: 'temp-utilities',
        label: 'Install Temporary Utilities',
        trade: 'Utilities',
        tradeColor: findTrade('Utilities')?.color,
        description: 'Set up temporary power, water, and sanitation',
        duration: 2,
        dependencies: ['clear-site']
      },
      {
        id: 'erosion-control',
        label: 'Install Erosion Control',
        trade: 'Excavation',
        tradeColor: findTrade('Excavation')?.color,
        description: 'Install silt fences and erosion control measures',
        duration: 1,
        dependencies: ['clear-site']
      },

      // Foundation
      {
        id: 'excavate-foundation',
        label: 'Excavate Foundation',
        trade: 'Excavation',
        tradeColor: findTrade('Excavation')?.color,
        description: 'Dig foundation footings and basement',
        duration: 3,
        dependencies: ['erosion-control']
      },
      {
        id: 'footings',
        label: 'Pour Footings',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Form and pour concrete footings',
        duration: 4,
        dependencies: ['excavate-foundation']
      },
      {
        id: 'foundation-walls',
        label: 'Foundation Walls',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Form and pour foundation walls',
        duration: 7,
        dependencies: ['footings']
      },
      {
        id: 'waterproofing',
        label: 'Foundation Waterproofing',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Apply waterproofing and install drain tiles',
        duration: 2,
        dependencies: ['foundation-walls']
      },
      {
        id: 'backfill',
        label: 'Backfill Foundation',
        trade: 'Excavation',
        tradeColor: findTrade('Excavation')?.color,
        description: 'Backfill around foundation walls',
        duration: 2,
        dependencies: ['waterproofing']
      },

      // Rough-ins
      {
        id: 'underground-plumbing',
        label: 'Underground Plumbing',
        trade: 'Plumbing',
        tradeColor: findTrade('Plumbing')?.color,
        description: 'Install under-slab plumbing',
        duration: 4,
        dependencies: ['foundation-walls']
      },
      {
        id: 'slab-prep',
        label: 'Basement Slab Preparation',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Install vapor barrier and prep for concrete',
        duration: 2,
        dependencies: ['underground-plumbing']
      },
      {
        id: 'pour-slab',
        label: 'Pour Basement Slab',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Pour and finish basement concrete slab',
        duration: 2,
        dependencies: ['slab-prep']
      },

      // Framing
      {
        id: 'first-floor',
        label: 'First Floor Framing',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Frame first floor walls and subfloor',
        duration: 8,
        dependencies: ['pour-slab', 'backfill']
      },
      {
        id: 'second-floor',
        label: 'Second Floor Framing',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Frame second floor walls and subfloor',
        duration: 8,
        dependencies: ['first-floor']
      },
      {
        id: 'roof-trusses',
        label: 'Roof Trusses',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Install roof trusses and sheathing',
        duration: 5,
        dependencies: ['second-floor']
      },

      // Exterior
      {
        id: 'roofing',
        label: 'Roofing Installation',
        trade: 'Roofing',
        tradeColor: findTrade('Roofing')?.color,
        description: 'Install roofing materials and flashings',
        duration: 4,
        dependencies: ['roof-trusses']
      },
      {
        id: 'windows-doors',
        label: 'Windows and Exterior Doors',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Install windows and exterior doors',
        duration: 3,
        dependencies: ['roof-trusses']
      },
      {
        id: 'siding',
        label: 'Siding Installation',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Install exterior siding and trim',
        duration: 7,
        dependencies: ['windows-doors']
      },

      // MEP Rough-ins
      {
        id: 'hvac-rough',
        label: 'HVAC Rough-in',
        trade: 'HVAC',
        tradeColor: findTrade('HVAC')?.color,
        description: 'Install HVAC ductwork and equipment',
        duration: 7,
        dependencies: ['roof-trusses']
      },
      {
        id: 'plumbing-rough',
        label: 'Plumbing Rough-in',
        trade: 'Plumbing',
        tradeColor: findTrade('Plumbing')?.color,
        description: 'Install water supply and drain lines',
        duration: 7,
        dependencies: ['roof-trusses']
      },
      {
        id: 'electrical-rough',
        label: 'Electrical Rough-in',
        trade: 'Electrical',
        tradeColor: findTrade('Electrical')?.color,
        description: 'Install electrical boxes, wiring, and panels',
        duration: 7,
        dependencies: ['roof-trusses']
      },

      // Insulation and Drywall
      {
        id: 'insulation',
        label: 'Insulation Installation',
        trade: 'Framing',
        tradeColor: findTrade('Framing')?.color,
        description: 'Install wall and ceiling insulation',
        duration: 4,
        dependencies: ['electrical-rough', 'plumbing-rough', 'hvac-rough']
      },
      {
        id: 'drywall-hang',
        label: 'Hang Drywall',
        trade: 'Drywall',
        tradeColor: findTrade('Drywall')?.color,
        description: 'Install drywall on walls and ceilings',
        duration: 5,
        dependencies: ['insulation']
      },
      {
        id: 'drywall-finish',
        label: 'Finish Drywall',
        trade: 'Drywall',
        tradeColor: findTrade('Drywall')?.color,
        description: 'Tape, mud, and sand drywall',
        duration: 7,
        dependencies: ['drywall-hang']
      },

      // Interior Finishes
      {
        id: 'paint-prime',
        label: 'Prime Walls',
        trade: 'Painting',
        tradeColor: findTrade('Painting')?.color,
        description: 'Apply primer to all walls and ceilings',
        duration: 3,
        dependencies: ['drywall-finish']
      },
      {
        id: 'cabinet-install',
        label: 'Install Cabinets',
        trade: 'Millwork',
        tradeColor: findTrade('Millwork')?.color,
        description: 'Install kitchen and bathroom cabinets',
        duration: 4,
        dependencies: ['paint-prime']
      },
      {
        id: 'doors-trim',
        label: 'Interior Doors and Trim',
        trade: 'Millwork',
        tradeColor: findTrade('Millwork')?.color,
        description: 'Install interior doors and trim work',
        duration: 6,
        dependencies: ['paint-prime']
      },
      {
        id: 'paint-final',
        label: 'Final Painting',
        trade: 'Painting',
        tradeColor: findTrade('Painting')?.color,
        description: 'Apply final coat of paint',
        duration: 5,
        dependencies: ['doors-trim', 'cabinet-install']
      },

      // Flooring
      {
        id: 'tile-work',
        label: 'Tile Installation',
        trade: 'Tile',
        tradeColor: findTrade('Tile')?.color,
        description: 'Install tile in bathrooms and kitchen',
        duration: 6,
        dependencies: ['cabinet-install']
      },
      {
        id: 'hardwood',
        label: 'Hardwood Flooring',
        trade: 'Flooring',
        tradeColor: findTrade('Flooring')?.color,
        description: 'Install hardwood floors',
        duration: 5,
        dependencies: ['doors-trim']
      },
      {
        id: 'carpet',
        label: 'Carpet Installation',
        trade: 'Flooring',
        tradeColor: findTrade('Flooring')?.color,
        description: 'Install carpet in bedrooms',
        duration: 2,
        dependencies: ['doors-trim']
      },

      // MEP Finishes
      {
        id: 'electrical-trim',
        label: 'Electrical Trim',
        trade: 'Electrical',
        tradeColor: findTrade('Electrical')?.color,
        description: 'Install fixtures, switches, and outlets',
        duration: 4,
        dependencies: ['paint-final']
      },
      {
        id: 'plumbing-trim',
        label: 'Plumbing Trim',
        trade: 'Plumbing',
        tradeColor: findTrade('Plumbing')?.color,
        description: 'Install fixtures and appliances',
        duration: 3,
        dependencies: ['tile-work']
      },
      {
        id: 'hvac-trim',
        label: 'HVAC Trim',
        trade: 'HVAC',
        tradeColor: findTrade('HVAC')?.color,
        description: 'Install registers and test system',
        duration: 2,
        dependencies: ['electrical-trim']
      },

      // Exterior Completion
      {
        id: 'driveway',
        label: 'Pour Driveway',
        trade: 'Foundation',
        tradeColor: findTrade('Foundation')?.color,
        description: 'Form and pour concrete driveway',
        duration: 3,
        dependencies: ['siding']
      },
      {
        id: 'landscaping',
        label: 'Landscaping',
        trade: 'Landscaping',
        tradeColor: findTrade('Landscaping')?.color,
        description: 'Grade yard, plant trees, and lay sod',
        duration: 5,
        dependencies: ['driveway']
      },

      // Final Steps
      {
        id: 'final-clean',
        label: 'Final Cleaning',
        description: 'Deep clean entire house',
        duration: 2,
        dependencies: ['electrical-trim', 'plumbing-trim', 'hvac-trim', 'carpet']
      },
      {
        id: 'inspection',
        label: 'Final Inspection',
        description: 'Municipal final inspection',
        duration: 1,
        dependencies: ['final-clean']
      }
    ]
  }
];