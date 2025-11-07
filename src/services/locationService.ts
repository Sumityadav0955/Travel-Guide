// Location service for managing location data
import type { Location, LocationCategory, SearchFilters as SearchFiltersType } from '../types';
import { API_CONFIG, API_ENDPOINTS, APP_CONFIG, ERROR_MESSAGES, CONTENT_TYPES } from '../constants';
import { api, ApiError } from '../utils/api';

export interface LocationSubmissionData {
  name: string;
  description: string;
  specialtyDescription: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: LocationCategory;
  photos?: File[];
}

class LocationService {
  private baseUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOCATIONS.BASE}`;

  async submitLocation(locationData: LocationSubmissionData): Promise<Location> {
    try {
      // For now, simulate API call with mock data
      // In a real implementation, this would make an HTTP request
      const mockLocation: Location = {
        id: `loc_${Date.now()}`,
        name: locationData.name,
        description: locationData.description,
        specialtyDescription: locationData.specialtyDescription,
        coordinates: locationData.coordinates,
        category: locationData.category,
        submittedBy: 'current-user-id', // Would come from auth context
        photos: [],
        averageRating: 0,
        reviewCount: 0,
        createdAt: new Date(),
        verified: false,
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockLocation;
    } catch (error) {
      console.error('Error submitting location:', error);
      throw new Error('Failed to submit location. Please try again.');
    }
  }

  async getLocations(): Promise<Location[]> {
    try {
      // Mock implementation - would be replaced with actual API call
      return [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations.');
    }
  }

  async searchLocations(filters: Partial<SearchFiltersType>): Promise<Location[]> {
    try {
      // Mock implementation with sample data for demonstration
      // In a real implementation, this would make an HTTP request with filters
      
      const mockLocations: Location[] = [
        // Delhi Locations
        {
          id: 'loc_1',
          name: 'Hauz Khas Village Secret Garden',
          description: 'A hidden rooftop garden cafe in the heart of Hauz Khas Village with stunning views of the ancient monuments.',
          specialtyDescription: 'This secret spot is tucked away behind the main street. Locals come here for sunset views over the Hauz Khas Complex and deer park. The cafe serves authentic Delhi street food with a modern twist.',
          coordinates: { latitude: 28.5494, longitude: 77.1960 },
          category: 'hidden-gem',
          submittedBy: 'delhi_local_1',
          photos: [],
          averageRating: 4.7,
          reviewCount: 18,
          createdAt: new Date('2024-01-15'),
          verified: true,
        },
        {
          id: 'loc_2',
          name: 'Paranthe Wali Gali',
          description: 'A narrow lane in Old Delhi famous for its traditional stuffed parathas, operating since the 1870s.',
          specialtyDescription: 'This historic alley has been serving over 25 varieties of parathas for generations. Each shop has its own secret recipes passed down through families. Best visited early morning for fresh parathas.',
          coordinates: { latitude: 28.6506, longitude: 77.2303 },
          category: 'food',
          submittedBy: 'delhi_local_2',
          photos: [],
          averageRating: 4.9,
          reviewCount: 45,
          createdAt: new Date('2024-02-01'),
          verified: true,
        },
        {
          id: 'loc_3',
          name: 'Agrasen ki Baoli',
          description: 'A 14th-century stepwell hidden in the middle of modern Delhi, offering a peaceful escape from city chaos.',
          specialtyDescription: 'This ancient stepwell has 108 steps and is a protected monument. Despite being in central Delhi, it remains relatively unknown to tourists. The architecture is stunning and it\'s completely free to visit.',
          coordinates: { latitude: 28.5926, longitude: 77.2197 },
          category: 'history',
          submittedBy: 'delhi_local_3',
          photos: [],
          averageRating: 4.6,
          reviewCount: 32,
          createdAt: new Date('2024-01-20'),
          verified: true,
        },
        {
          id: 'loc_4',
          name: 'Lodhi Art District',
          description: 'India\'s first open-air public art district featuring massive murals by international and Indian artists.',
          specialtyDescription: 'This neighborhood has been transformed into an outdoor art gallery. Walk through residential streets to discover incredible street art on building walls. Best explored on foot or bicycle.',
          coordinates: { latitude: 28.5921, longitude: 77.2197 },
          category: 'art',
          submittedBy: 'delhi_local_4',
          photos: [],
          averageRating: 4.8,
          reviewCount: 28,
          createdAt: new Date('2024-01-25'),
          verified: true,
        },
        
        // Mumbai Locations
        {
          id: 'loc_5',
          name: 'Sassoon Dock Fish Market',
          description: 'Mumbai\'s oldest and largest fish market, bustling with activity from 4 AM to 10 AM.',
          specialtyDescription: 'Experience the real Mumbai at this wholesale fish market. Fishermen bring in fresh catch daily. The energy, colors, and authentic local life make it a photographer\'s paradise. Visit early morning for the best experience.',
          coordinates: { latitude: 18.9067, longitude: 72.8147 },
          category: 'local-life',
          submittedBy: 'mumbai_local_1',
          photos: [],
          averageRating: 4.5,
          reviewCount: 22,
          createdAt: new Date('2024-02-05'),
          verified: true,
        },
        {
          id: 'loc_6',
          name: 'Khotachiwadi Heritage Village',
          description: 'A 19th-century East Indian village preserved in the heart of Mumbai with Portuguese-style houses.',
          specialtyDescription: 'This hidden gem is a time capsule of old Bombay. Walk through narrow lanes lined with colorful heritage homes. Many families have lived here for generations and are happy to share stories.',
          coordinates: { latitude: 18.9570, longitude: 72.8310 },
          category: 'culture',
          submittedBy: 'mumbai_local_2',
          photos: [],
          averageRating: 4.7,
          reviewCount: 35,
          createdAt: new Date('2024-01-18'),
          verified: true,
        },
        {
          id: 'loc_7',
          name: 'Mahim Nature Park',
          description: 'A 37-acre urban forest and bird sanctuary built on a former dumping ground.',
          specialtyDescription: 'This ecological success story is home to over 80 bird species. Perfect for morning walks and bird watching. The park has walking trails, a butterfly garden, and offers a peaceful escape from Mumbai\'s chaos.',
          coordinates: { latitude: 19.0403, longitude: 72.8397 },
          category: 'nature',
          submittedBy: 'mumbai_local_3',
          photos: [],
          averageRating: 4.4,
          reviewCount: 19,
          createdAt: new Date('2024-02-10'),
          verified: true,
        },
        {
          id: 'loc_8',
          name: 'Britannia & Co. Restaurant',
          description: 'An iconic Parsi restaurant serving authentic berry pulao since 1923.',
          specialtyDescription: 'Run by the same family for four generations, this restaurant is a Mumbai institution. The berry pulao is legendary, and the owner often shares stories about old Bombay. Expect a wait during lunch hours.',
          coordinates: { latitude: 18.9398, longitude: 72.8345 },
          category: 'food',
          submittedBy: 'mumbai_local_4',
          photos: [],
          averageRating: 4.8,
          reviewCount: 52,
          createdAt: new Date('2024-01-22'),
          verified: true,
        },
        
        // Uttarakhand Locations
        {
          id: 'loc_9',
          name: 'Deoria Tal',
          description: 'A pristine high-altitude lake offering mirror reflections of Chaukhamba peaks.',
          specialtyDescription: 'This emerald lake sits at 2,438m and requires a 3km trek from Sari village. Camp overnight to witness stunning sunrise views. The lake perfectly reflects the Chaukhamba massif - a photographer\'s dream.',
          coordinates: { latitude: 30.5833, longitude: 79.0500 },
          category: 'nature',
          submittedBy: 'uttarakhand_local_1',
          photos: [],
          averageRating: 4.9,
          reviewCount: 41,
          createdAt: new Date('2024-01-12'),
          verified: true,
        },
        {
          id: 'loc_10',
          name: 'Mukteshwar Temple & Viewpoint',
          description: 'A 350-year-old Shiva temple perched on a hilltop with panoramic Himalayan views.',
          specialtyDescription: 'This temple offers 180-degree views of the Himalayan range. The town of Mukteshwar is less crowded than Nainital but equally beautiful. Visit the nearby fruit orchards and try local jams.',
          coordinates: { latitude: 29.4714, longitude: 79.6473 },
          category: 'culture',
          submittedBy: 'uttarakhand_local_2',
          photos: [],
          averageRating: 4.7,
          reviewCount: 38,
          createdAt: new Date('2024-02-03'),
          verified: true,
        },
        {
          id: 'loc_11',
          name: 'Chopta - Mini Switzerland',
          description: 'An untouched meadow at 2,680m, base for Tungnath temple trek and Chandrashila peak.',
          specialtyDescription: 'Known as the "Mini Switzerland of India", Chopta offers pristine meadows and dense forests. It\'s the starting point for the highest Shiva temple trek. Winter brings heavy snow, making it a winter wonderland.',
          coordinates: { latitude: 30.4700, longitude: 79.0500 },
          category: 'adventure',
          submittedBy: 'uttarakhand_local_3',
          photos: [],
          averageRating: 4.9,
          reviewCount: 56,
          createdAt: new Date('2024-01-08'),
          verified: true,
        },
        {
          id: 'loc_12',
          name: 'Binsar Wildlife Sanctuary',
          description: 'A 47 sq km sanctuary offering 300km panoramic views of Himalayan peaks including Nanda Devi.',
          specialtyDescription: 'This sanctuary is home to leopards, barking deer, and over 200 bird species. The Zero Point viewpoint offers breathtaking sunrise views. Stay in forest rest houses for an immersive experience.',
          coordinates: { latitude: 29.6833, longitude: 79.7000 },
          category: 'nature',
          submittedBy: 'uttarakhand_local_4',
          photos: [],
          averageRating: 4.8,
          reviewCount: 33,
          createdAt: new Date('2024-01-30'),
          verified: true,
        },
        {
          id: 'loc_13',
          name: 'Jageshwar Dham',
          description: 'A complex of 124 ancient stone temples dating back to 9th-13th century, nestled in deodar forests.',
          specialtyDescription: 'This archaeological site is one of the 12 Jyotirlingas. The temples are architectural marvels with intricate carvings. The serene forest setting adds to the spiritual atmosphere. Rarely crowded.',
          coordinates: { latitude: 29.6500, longitude: 79.8333 },
          category: 'history',
          submittedBy: 'uttarakhand_local_5',
          photos: [],
          averageRating: 4.7,
          reviewCount: 29,
          createdAt: new Date('2024-02-08'),
          verified: true,
        },
        {
          id: 'loc_14',
          name: 'Kanatal Adventure Camp',
          description: 'A peaceful hill station offering adventure activities and stunning valley views.',
          specialtyDescription: 'Less commercialized than Mussoorie, Kanatal offers camping, rappelling, and rock climbing. The Tehri Dam view is spectacular. Perfect for a quiet weekend getaway with adventure activities.',
          coordinates: { latitude: 30.4167, longitude: 78.3333 },
          category: 'adventure',
          submittedBy: 'uttarakhand_local_6',
          photos: [],
          averageRating: 4.6,
          reviewCount: 24,
          createdAt: new Date('2024-02-12'),
          verified: true,
        },
      ];

      // Apply filters (simplified mock filtering)
      let filteredLocations = [...mockLocations];

      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredLocations = filteredLocations.filter(location =>
          location.name.toLowerCase().includes(query) ||
          location.description.toLowerCase().includes(query) ||
          location.specialtyDescription.toLowerCase().includes(query)
        );
      }

      if (filters.category) {
        filteredLocations = filteredLocations.filter(location =>
          location.category === filters.category
        );
      }

      if (filters.minRating) {
        filteredLocations = filteredLocations.filter(location =>
          location.averageRating >= filters.minRating!
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'rating':
            filteredLocations.sort((a, b) => b.averageRating - a.averageRating);
            break;
          case 'recency':
            filteredLocations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'relevance':
          default:
            // Keep original order for relevance
            break;
        }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return filteredLocations;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw new Error('Failed to search locations.');
    }
  }

  async getLocationById(id: string): Promise<Location | null> {
    try {
      // Mock implementation - get from the mock locations
      const allLocations = await this.searchLocations({});
      const location = allLocations.find(loc => loc.id === id);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return location || null;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location.');
    }
  }

  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }
}

const locationService = new LocationService();
export default locationService;