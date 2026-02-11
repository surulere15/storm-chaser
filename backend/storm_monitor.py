#!/usr/bin/env python3
"""
STORM CHASER - Real-time Storm Monitoring Engine
Data Source: NOAA/NWS API (100% FREE, UNLIMITED)
Cost: $0/month
"""

import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time

# Free APIs - No cost
NOAA_ALERTS_API = "https://api.weather.gov/alerts/active"
OPENWEATHER_API = "https://api.openweathermap.org/data/2.5/weather"

class StormMonitor:
    """Monitor severe weather in real-time using free NOAA API"""

    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.openweather_key = os.getenv("OPENWEATHER_API_KEY", "")  # Optional

        # Storm types we care about (roof damage potential)
        self.target_events = [
            "Tornado Warning",
            "Severe Thunderstorm Warning",
            "Tornado Watch",
            "Severe Thunderstorm Watch",
            "Hurricane Warning",
            "Hurricane Watch",
            "Flash Flood Warning",
            "High Wind Warning"
        ]

    def fetch_active_storms(self) -> List[Dict]:
        """
        Fetch all active severe weather alerts from NOAA
        API: FREE, UNLIMITED
        """
        try:
            print(f"[{datetime.now()}] Fetching active storms from NOAA...")

            headers = {
                "User-Agent": "StormChaser/1.0 (contact@stormchaser.ai)",
                "Accept": "application/geo+json"
            }

            response = requests.get(NOAA_ALERTS_API, headers=headers, timeout=30)
            response.raise_for_status()

            data = response.json()
            features = data.get("features", [])

            print(f"✅ Found {len(features)} total weather alerts")

            # Filter for severe weather only
            severe_storms = []
            for feature in features:
                if not feature:
                    continue

                props = feature.get("properties", {})
                if not props:
                    continue

                event_type = props.get("event", "")

                if any(target in event_type for target in self.target_events):
                    storm_data = self._parse_storm_data(feature)
                    if storm_data:
                        severe_storms.append(storm_data)

            print(f"🌪️  {len(severe_storms)} SEVERE storms requiring contractor alerts")

            return severe_storms

        except Exception as e:
            print(f"❌ Error fetching storms: {e}")
            return []

    def _parse_storm_data(self, feature: Dict) -> Optional[Dict]:
        """Parse NOAA GeoJSON into our storm format"""
        try:
            props = feature.get("properties", {})
            geometry = feature.get("geometry", {})

            if not props:
                return None

            # Extract location
            coordinates = geometry.get("coordinates", [[[]]])
            if coordinates and len(coordinates) > 0:
                # Get first coordinate pair
                first_coord = coordinates[0]
                if isinstance(first_coord[0], list):
                    lon, lat = first_coord[0][0], first_coord[0][1]
                else:
                    lon, lat = first_coord[0], first_coord[1]
            else:
                lon, lat = None, None

            # Calculate severity (1-10 scale)
            severity = self._calculate_severity(props)

            storm_data = {
                "event_id": props.get("id", ""),
                "event_type": self._normalize_event_type(props.get("event", "")),
                "severity": severity,
                "headline": props.get("headline", ""),
                "description": props.get("description", ""),
                "instruction": props.get("instruction", ""),

                # Location
                "area_desc": props.get("areaDesc", ""),
                "longitude": lon,
                "latitude": lat,

                # Timing
                "onset": props.get("onset"),
                "expires": props.get("expires"),
                "sent": props.get("sent"),

                # Additional data
                "urgency": props.get("urgency", ""),
                "severity_nws": props.get("severity", ""),
                "certainty": props.get("certainty", ""),

                # Raw data for future analysis
                "raw_data": props
            }

            return storm_data

        except Exception as e:
            print(f"⚠️  Error parsing storm data: {e}")
            return None

    def _normalize_event_type(self, event: str) -> str:
        """Convert NWS event names to our categories"""
        event_lower = event.lower()

        if "tornado" in event_lower:
            return "tornado"
        elif "thunderstorm" in event_lower or "hail" in event_lower:
            return "severe_thunderstorm"
        elif "hurricane" in event_lower:
            return "hurricane"
        elif "wind" in event_lower:
            return "high_wind"
        elif "flood" in event_lower:
            return "flash_flood"
        else:
            return "severe_weather"

    def _calculate_severity(self, props: Dict) -> int:
        """
        Calculate damage severity score (1-10)
        Higher = more likely to cause roof damage = better leads
        """
        score = 5  # Base severity

        event = props.get("event", "").lower()
        urgency = props.get("urgency", "").lower()
        severity = props.get("severity", "").lower()
        certainty = props.get("certainty", "").lower()

        # Event type multipliers
        if "tornado" in event:
            score = 10
        elif "hurricane" in event and "warning" in event:
            score = 9
        elif "severe thunderstorm warning" in event:
            score = 7
        elif "high wind warning" in event:
            score = 6

        # Urgency boost
        if urgency == "immediate":
            score += 1

        # Severity boost
        if severity == "extreme":
            score += 2
        elif severity == "severe":
            score += 1

        # Certainty reduction
        if certainty == "possible":
            score -= 1

        return max(1, min(10, score))  # Clamp between 1-10

    def estimate_affected_homes(self, storm: Dict) -> int:
        """
        Estimate number of homes in affected area
        Uses area description to approximate
        """
        area_desc = storm.get("area_desc", "").lower()

        # Simple heuristic based on area description
        if "county" in area_desc or "counties" in area_desc:
            # Average county has ~50,000 homes
            num_counties = area_desc.count("county")
            return num_counties * 50000
        elif "city" in area_desc or "town" in area_desc:
            return 20000  # Average small city
        else:
            return 10000  # Default estimate

    def generate_leads_for_storm(self, storm: Dict) -> List[Dict]:
        """
        Generate property leads in storm-affected area
        Uses FREE geocoding and property data APIs
        """
        print(f"\n🏠 Generating leads for storm: {storm.get('headline')}")

        leads = []

        # For now, return placeholder
        # In production, this would:
        # 1. Geocode affected area using Nominatim (free)
        # 2. Get property data from Census API (free)
        # 3. Score properties by value/age
        # 4. Return sorted list of high-value leads

        print(f"✅ Generated {len(leads)} leads")
        return leads

    def save_to_database(self, storms: List[Dict]):
        """Save storms to Supabase database"""
        # TODO: Implement Supabase integration
        # For now, just save to JSON file
        output_file = "/tmp/storm_chaser_active_storms.json"

        with open(output_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_storms": len(storms),
                "storms": storms
            }, f, indent=2)

        print(f"💾 Saved {len(storms)} storms to {output_file}")

    def run_monitoring_cycle(self):
        """Single monitoring cycle - run this every 5 minutes"""
        print("\n" + "="*60)
        print(f"🌪️  STORM CHASER - Monitoring Cycle")
        print(f"   Timestamp: {datetime.now()}")
        print("="*60)

        # Fetch active storms
        storms = self.fetch_active_storms()

        if not storms:
            print("✅ No severe weather currently. All clear.")
            return

        # Process each storm
        for storm in storms:
            print(f"\n📍 Processing: {storm['headline']}")
            print(f"   Type: {storm['event_type']}")
            print(f"   Severity: {storm['severity']}/10")
            print(f"   Location: {storm['area_desc']}")

            # Estimate impact
            estimated_homes = self.estimate_affected_homes(storm)
            storm['estimated_homes'] = estimated_homes
            print(f"   Estimated homes affected: {estimated_homes:,}")

            # Generate leads (TODO: implement)
            # leads = self.generate_leads_for_storm(storm)
            # storm['leads'] = leads

        # Save to database
        self.save_to_database(storms)

        # Alert contractors (TODO: implement)
        # self.send_contractor_alerts(storms)

        print("\n✅ Monitoring cycle complete")


def main():
    """Main execution - can be run via GitHub Actions every 5 minutes"""

    monitor = StormMonitor()

    # Run single cycle
    monitor.run_monitoring_cycle()

    # For continuous monitoring (local development):
    # while True:
    #     monitor.run_monitoring_cycle()
    #     print(f"\n💤 Sleeping for 5 minutes...")
    #     time.sleep(300)  # 5 minutes


if __name__ == "__main__":
    main()
