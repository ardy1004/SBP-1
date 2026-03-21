// Placeholder hooks mapping to demonstrate structure for real backend connection
import { useQuery } from "@tanstack/react-query";
import { mockProperties } from "@/data/properties";

// In a real app this would call an API
export function useProperties() {
  return useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockProperties;
    },
  });
}

export function useProperty(slug: string) {
  return useQuery({
    queryKey: ["/api/properties", slug],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const property = mockProperties.find(p => p.slug === slug);
      if (!property) throw new Error("Property not found");
      return property;
    },
  });
}
