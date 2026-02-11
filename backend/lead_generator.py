#!/usr/bin/env python3
"""
LEAD GENERATION ENGINE - 100% FREE APIs
Converts storm zones into high-value contractor leads
Cost: $0/month
"""

import requests
import time
from typing import List, Dict, Optional
import os
import json

class LeadGenerator:
    """Generate property leads using free geocoding and property data APIs"""

    def __init__(self):
        # FREE API endpoints
        self.nominatim_url = "https://nominatim.openstreetmap.org"  # FREE geocoding
        self.census_url = "https://geocoding.geo.census.gov/geocoder"  # FREE property data

        # Rate limits (respectful use of free services)
        self.nominatim_rate_limit = 1.0  # 1 second between requests
        self.last_nominatim_call = 0

    def geocode_storm_area(self, area_description: str) -> Dict:
        """
        Convert storm area description to coordinates
        API: Nominatim (OpenStreetMap) - FREE, unlimited with rate limit
        """
        # Respect rate limit
        time_since_last = time.time() - self.last_nominatim_call
        if time_since_last < self.nominatim_rate_limit:
            time.sleep(self.nominatim_rate_limit - time_since_last)

        try:
            print(f"🗺️  Geocoding: {area_description}")

            url = f"{self.nominatim_url}/search"
            params = {
                "q": area_description,
                "format": "json",
                "limit": 1,
                "countrycodes": "us"
            }
            headers = {
                "User-Agent": "StormChaser/1.0 (contact@stormchaser.ai)"
            }

            response = requests.get(url, params=params, headers=headers, timeout=10)
            self.last_nominatim_call = time.time()

            if response.status_code == 200 and response.json():
                data = response.json()[0]
                return {
                    "latitude": float(data["lat"]),
                    "longitude": float(data["lon"]),
                    "display_name": data["display_name"],
                    "bounding_box": data.get("boundingbox", [])
                }
            else:
                print(f"⚠️  No results for: {area_description}")
                return None

        except Exception as e:
            print(f"❌ Geocoding error: {e}")
            return None

    def get_properties_in_area(self, lat: float, lon: float, radius_miles: float = 5) -> List[Dict]:
        """
        Get properties in affected area
        Uses FREE Census Geocoding API + simulated property data
        """
        properties = []

        try:
            print(f"🏘️  Finding properties near ({lat}, {lon}), radius {radius_miles} miles")

            # In production, this would:
            # 1. Use Census API to get addresses in area
            # 2. Use county assessor data (free public records)
            # 3. Scrape Zillow/Redfin for property values
            # 4. Cross-reference with demographic data

            # For now, simulate based on typical suburban density
            # Average suburban area: 1,000 homes per square mile
            area_sq_miles = 3.14159 * (radius_miles ** 2)
            estimated_homes = int(area_sq_miles * 1000)

            print(f"   Estimated {estimated_homes:,} homes in {area_sq_miles:.1f} sq miles")

            # Simulate property distribution
            # In production, replace with actual API calls
            for i in range(min(estimated_homes, 100)):  # Cap at 100 for demo
                property_data = self._simulate_property(lat, lon, i)
                properties.append(property_data)

            print(f"✅ Generated {len(properties)} property leads")

        except Exception as e:
            print(f"❌ Error finding properties: {e}")

        return properties

    def _simulate_property(self, base_lat: float, base_lon: float, index: int) -> Dict:
        """
        Simulate property data (replace with real APIs in production)
        """
        import random

        # Slight offset for different properties
        lat_offset = (random.random() - 0.5) * 0.01
        lon_offset = (random.random() - 0.5) * 0.01

        property_data = {
            "address": f"{random.randint(100, 9999)} Main St",
            "city": "Example City",
            "state": "NC",
            "zip": "27701",
            "latitude": base_lat + lat_offset,
            "longitude": base_lon + lon_offset,

            # Property details (would come from county assessor)
            "estimated_value": random.randint(200000, 800000),
            "year_built": random.randint(1970, 2020),
            "square_footage": random.randint(1500, 4000),
            "roof_type": random.choice(["Asphalt Shingle", "Metal", "Tile", "Wood"]),

            # Would come from property records
            "owner_name": f"Homeowner #{index + 1}",
            "owner_type": random.choice(["individual", "llc", "trust"]),
        }

        return property_data

    def score_lead(self, property_data: Dict, storm_severity: int) -> int:
        """
        Score lead quality (0-100)
        Higher score = better lead for contractors
        """
        score = 0

        # Property value (higher = better)
        value = property_data.get("estimated_value", 0)
        if value > 500000:
            score += 30
        elif value > 300000:
            score += 20
        elif value > 200000:
            score += 10

        # Property age (older = more likely to need roof)
        age = 2024 - property_data.get("year_built", 2020)
        if age > 30:
            score += 25
        elif age > 20:
            score += 15
        elif age > 10:
            score += 5

        # Storm severity multiplier
        score += storm_severity * 3  # Max 30 points

        # Roof type (some are more damage-prone)
        roof_type = property_data.get("roof_type", "")
        if roof_type in ["Asphalt Shingle", "Wood"]:
            score += 10  # More vulnerable to damage

        # Owner type (individuals respond faster than LLCs)
        if property_data.get("owner_type") == "individual":
            score += 5

        return min(score, 100)  # Cap at 100

    def generate_leads_for_storm(self, storm_data: Dict) -> List[Dict]:
        """
        Main function: Convert storm data into ranked contractor leads
        """
        print(f"\n{'='*60}")
        print(f"🎯 GENERATING LEADS FOR STORM")
        print(f"   Event: {storm_data.get('headline', 'Unknown')}")
        print(f"   Severity: {storm_data.get('severity', 0)}/10")
        print(f"{'='*60}\n")

        # Step 1: Geocode storm area
        area_desc = storm_data.get("area_desc", "")
        if not area_desc:
            print("⚠️  No area description provided")
            return []

        location = self.geocode_storm_area(area_desc)
        if not location:
            return []

        # Step 2: Get properties in affected area
        properties = self.get_properties_in_area(
            location["latitude"],
            location["longitude"],
            radius_miles=10  # Configurable based on storm type
        )

        # Step 3: Score and rank leads
        leads = []
        storm_severity = storm_data.get("severity", 5)

        for prop in properties:
            lead_score = self.score_lead(prop, storm_severity)

            lead = {
                **prop,
                "storm_id": storm_data.get("event_id"),
                "damage_score": storm_severity * 10,  # 1-10 scale to 10-100
                "lead_quality_score": lead_score,
                "status": "available"
            }
            leads.append(lead)

        # Sort by lead quality (best first)
        leads.sort(key=lambda x: x["lead_quality_score"], reverse=True)

        print(f"\n✅ LEAD GENERATION COMPLETE")
        print(f"   Total leads: {len(leads)}")
        if leads:
            print(f"   Top lead score: {leads[0]['lead_quality_score']}/100")
            print(f"   Average score: {sum(l['lead_quality_score'] for l in leads) / len(leads):.1f}/100")

        return leads


def main():
    """Test lead generation"""
    generator = LeadGenerator()

    # Test with sample storm data
    test_storm = {
        "event_id": "test-001",
        "headline": "Severe Thunderstorm Warning",
        "area_desc": "Durham County, NC",
        "severity": 8,
        "event_type": "severe_thunderstorm"
    }

    leads = generator.generate_leads_for_storm(test_storm)

    # Print top 10 leads
    print(f"\n📊 TOP 10 LEADS:")
    print("-" * 80)
    for i, lead in enumerate(leads[:10], 1):
        print(f"{i:2d}. {lead['address']:30s} | "
              f"Score: {lead['lead_quality_score']:3d}/100 | "
              f"Value: ${lead['estimated_value']:,} | "
              f"Age: {2024 - lead['year_built']} yrs")

    # Save to file
    output_file = "/tmp/storm_chaser_leads.json"
    with open(output_file, "w") as f:
        json.dump(leads, f, indent=2)
    print(f"\n💾 Saved {len(leads)} leads to {output_file}")


if __name__ == "__main__":
    main()
