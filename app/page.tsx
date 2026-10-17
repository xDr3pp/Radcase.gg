export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <p style={{ color: '#ff4655', fontWeight: 800, letterSpacing: 2 }}>RADCASE.GG · FOUNDATION</p>
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>A profilok alapjai elkészültek.</h1>
      <p style={{ color: '#b5b5c0', lineHeight: 1.7, maxWidth: 700 }}>
        Ez a fejlesztői alap a következő lépés: szerveroldali API, adatbázis-séma és biztonságos Riot Sign On előkészítés. Még nincs Riot-fiókhoz kapcsolva, és nem jelenít meg valódi fiókadatokat.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
        <a href="/demo.html" style={{ background: '#ff4655', color: 'white', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>Demó megnyitása</a>
        <a href="/api/health" style={{ border: '1px solid #343541', color: 'white', padding: '12px 16px', borderRadius: 8, textDecoration: 'none' }}>API állapot ellenőrzése</a>
      </div>
      <section style={{ marginTop: 44, padding: 20, border: '1px solid #292a35', borderRadius: 12, background: '#11121a' }}>
        <h2 style={{ marginTop: 0 }}>Fontos</h2>
        <p style={{ color: '#b5b5c0', lineHeight: 1.7, marginBottom: 0 }}>A Riot Sign On bekötését csak a Riot jóváhagyása és az RSO hozzáférés kiadása után szabad aktiválni. A játékos jelszavát vagy kliens-munkamenet tokenjét soha nem kérjük el.</p>
      </section>
    </main>
  );
}
