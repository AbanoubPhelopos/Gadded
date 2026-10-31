export function SolarIllustration() {
  return <svg className="solar-illustration" viewBox="0 0 450 260" fill="none" aria-hidden="true">
    <circle cx="300" cy="94" r="68" stroke="#9dbe84" strokeOpacity=".13"/><circle cx="300" cy="94" r="99" stroke="#9dbe84" strokeOpacity=".1"/><circle cx="300" cy="94" r="37" fill="#d5eaaa"/>
    <path d="m50 203 190-80 161 58-190 80z" fill="#0e302b"/><path d="m74 179 173-73 133 50-173 73z" fill="#315e51" stroke="#9eb9a2" strokeWidth="1.2"/>
    <path d="m74 179 133 50v11L74 190z" fill="#244b40"/><path d="m207 229 173-73v11l-173 73z" fill="#1a4439"/>
    {[0,1,2,3].map(i => <g key={i}><path d={`m${87+i*41} ${176-i*17} 26-11 110 41-26 11z`} fill={i%2 ? '#416f60' : '#3d695b'} stroke="#a3c2ab" strokeWidth=".65"/>
      {[1,2,3,4].map(j => <path key={j} d={`m${87+i*41+j*22} ${176-i*17+j*8.2} 26-11`} stroke="#a3c2ab" strokeWidth=".5"/>)}</g>)}
    <path d="M108 201v22m232-42v22m-127 37v12" stroke="#8da692" strokeWidth="3"/><path d="m75 235 62-26m200 14 63-26" stroke="#7d9c83" strokeOpacity=".3"/>
    <circle cx="93" cy="92" r="4" fill="#d5eaaa"/><path d="M93 79v-7m0 40v-7m13-13h7m-40 0h7" stroke="#d5eaaa" strokeWidth="1.3"/>
  </svg>
}
