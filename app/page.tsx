export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <p style={{ color: '#ff4655', fontWeight: 800, letterSpacing: 2 }}>RADCASE.GG · PLAYER SHOWCASE</p>
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>Mutasd meg a VALORANT profilodat.</h1>
      <p style={{ color: '#b5b5c0', lineHeight: 1.7, maxWidth: 700 }}>
        Készíts megosztható játékosprofilt a rangoddal, fiókszinteddel és később a skin-gyűjteményeddel. A jelenlegi verzióban az adatokat kézzel adhatod meg; nincs Riot-fiókhoz kapcsolás vagy automatikus skin-lekérés.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
        <a href="/login" style={{ background: '#ff4655', color: 'white', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Profil létrehozása / belépés</a>
        <a href="/demo.html" style={{ border: '1px solid #343541', color: 'white', padding: '12px 16px', borderRadius: 8, textDecoration: 'none' }}>Demó megnyitása</a>
        <a href="/api/health" style={{ border: '1px solid #343541', color: 'white', padding: '12px 16px', borderRadius: 8, textDecoration: 'none' }}>API állapot</a>
      </div>
      <section style={{ marginTop: 44, padding: 20, border: '1px solid #292a35', borderRadius: 12, background: '#11121a' }}>
        <h2 style={{ marginTop: 0 }}>Adatvédelem és Riot-integráció</h2>
        <p style={{ color: '#b5b5c0', lineHeight: 1.7, marginBottom: 0 }}>
          A profil privát marad, amíg a tulajdonos kifejezetten nem engedélyezi a nyilvános megosztást. A Riot Sign On és a Riot-adatok integrációja külön jóváhagyást igényelhet. Riot-jelszót és kliens-munkamenet tokent soha nem kérünk el.
        </p>
      </section>
    </main>
  );
}
