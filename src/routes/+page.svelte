<!--
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 -->

<script lang="ts">
  /* global google */

  import * as GMAPILoader from '@googlemaps/js-api-loader';
  const { Loader } = GMAPILoader;

  import { onMount } from 'svelte';

  import SearchBar from './components/SearchBar.svelte';
  import Sections from './sections/Sections.svelte';

  // Temporarily hardcoding the API key for testing
  const googleMapsApiKey = 'AIzaSyDiuUAONlwJP3z3ndp3yyBob5fY_Exup4I';
  console.log('API Key:', googleMapsApiKey);
  const defaultPlace = {
    name: '303 S Technology Ct',
    address: '303 S Technology Ct',
    coordinates: {
      lat: 37.4385424,
      lng: -122.1272982
    }
  };
  let location: google.maps.LatLng | undefined;
  const zoom = 19;

  // Initialize app.
  let mapElement: HTMLElement;
  let map: google.maps.Map;
  let geometryLibrary: google.maps.GeometryLibrary;
  let mapsLibrary: google.maps.MapsLibrary;
  let placesLibrary: google.maps.PlacesLibrary;
  onMount(async () => {
    try {
      // Load the Google Maps libraries.
      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: "weekly",
        libraries: ["places", "geometry"],
      });
      
      // Load the main Maps JavaScript API first
      await loader.load();
      
      const libraries = {
        geometry: loader.importLibrary('geometry'),
        maps: loader.importLibrary('maps'),
        places: loader.importLibrary('places'),
      };
      
      geometryLibrary = await libraries.geometry;
      mapsLibrary = await libraries.maps;
      placesLibrary = await libraries.places;

      try {
        // Try geocoding first
        const geocoder = new google.maps.Geocoder();
        const geocoderResponse = await geocoder.geocode({
          address: defaultPlace.address,
        });
        const geocoderResult = geocoderResponse.results[0];
        location = geocoderResult.geometry.location;
      } catch (error: any) {
        // Only log as warning if it's an authorization error (expected until Geocoding API is enabled)
        if (error.message?.includes('not authorized')) {
          console.info('Using default coordinates - enable Geocoding API for address search');
        } else {
          console.warn('Geocoding failed, using default coordinates:', error);
        }
        // Fall back to default coordinates
        location = new google.maps.LatLng(defaultPlace.coordinates.lat, defaultPlace.coordinates.lng);
      }

      // Initialize the map at the desired location.
      map = new mapsLibrary.Map(mapElement, {
        center: location,
        zoom: zoom,
        tilt: 0,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        streetViewControl: false,
        zoomControl: false,
      });
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      // Add user-friendly error message to the UI
      const errorMessage = document.createElement('div');
      errorMessage.className = 'p-4 bg-red-100 text-red-700 rounded-lg';
      errorMessage.textContent = 'Error loading map. Please check your API configuration.';
      mapElement.appendChild(errorMessage);
    }
  });
</script>

<!-- Top bar -->
<div class="flex flex-col h-full">
  <!-- Search Bar -->
  <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-96">
    {#if placesLibrary && map}
      <SearchBar bind:location {placesLibrary} {map} initialValue={defaultPlace.name} />
    {/if}
  </div>

  <div class="flex flex-row h-full">
    <!-- Main map -->
    <div bind:this={mapElement} class="w-full" />

    <!-- Side bar -->
    <aside class="flex-none md:w-96 w-80 p-2 pt-3 overflow-auto">
      <div class="flex flex-col space-y-2 h-full">
        <!-- Logo -->
        <div class="p-4 text-center mb-4 bg-white rounded-lg shadow-md flex items-center justify-center">
          <img src="Logo.svg" alt="Imperium Solis" class="w-full" />
        </div>

        {#if location}
          <Sections {location} {map} {geometryLibrary} {googleMapsApiKey} />
        {/if}

        <div class="grow" />
      </div>
    </aside>
  </div>
</div>
