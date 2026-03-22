import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

function FloatingBlob({ position, color, speed = 0.5, distort = 0.3, size = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    ref.current.position.y = position[1] + Math.sin(t) * 0.3
    ref.current.position.x = position[0] + Math.cos(t * 0.7) * 0.15
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.1
  })

  return (
    <Sphere ref={ref} args={[size, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.35}
        distort={distort}
        speed={1.5}
        roughness={0.2}
      />
    </Sphere>
  )
}

export default function FloatingSpheres() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <FloatingBlob position={[-3.5, 1.5, -2]} color="#C4B5E0" speed={0.3} distort={0.4} size={1.4} />
      <FloatingBlob position={[3, -1, -3]} color="#8DD3C7" speed={0.4} distort={0.25} size={1.1} />
      <FloatingBlob position={[0.5, 2.5, -2.5]} color="#F5C6AA" speed={0.35} distort={0.3} size={0.9} />
      <FloatingBlob position={[-1.5, -2, -2]} color="#4F7DF3" speed={0.25} distort={0.2} size={0.7} />
    </Canvas>
  )
}
