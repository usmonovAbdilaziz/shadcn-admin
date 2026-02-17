import React, { useRef } from 'react'
import { YMaps, Map, GeolocationControl } from '@pbe/react-yandex-maps'

interface MapPickerProps {
  value?: { lat: number; lng: number }
  onChange: (coords: { lat: number; lng: number }) => void
}

const MapPicker: React.FC<MapPickerProps> = ({ value, onChange }) => {
  const mapRef = useRef<any>(null)

  // Default coordinates (Tashkent) if no value provided
  const center: [number, number] =
    value?.lat && value?.lng ? [value.lat, value.lng] : [41.311081, 69.240562]

  const handleActionEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter()
      onChange({
        lat: newCenter[0],
        lng: newCenter[1],
      })
    }
  }

  return (
    <div className='relative h-[400px] w-full overflow-hidden rounded-lg border'>
      <YMaps query={{ apikey: 'YOUR_API_KEY_HERE' }}>
        <Map
          instanceRef={mapRef}
          defaultState={{ center, zoom: 15 }}
          width='100%'
          height='100%'
          onActionEnd={handleActionEnd}
        >
          <GeolocationControl options={{ float: 'left' }} />
        </Map>
      </YMaps>

      {/* Central static marker */}
      <div className='pointer-events-none absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-full'>
        <img
          src='https://cdn-icons-png.flaticon.com/512/684/684908.png'
          alt='marker'
          className='h-10 w-10'
        />
      </div>
    </div>
  )
}

export default MapPicker
