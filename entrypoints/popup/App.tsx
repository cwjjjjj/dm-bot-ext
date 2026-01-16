function App() {
  return (
    <div
      style={{
        width: '320px',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <header
        style={{
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            color: '#1a1a1a',
          }}
        >
          DM Bot Extension
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            margin: '8px 0 0 0',
          }}
        >
          Quick DM for Instagram
        </p>
      </header>

      <main>
        <section
          style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              margin: '0 0 12px 0',
              color: '#333',
            }}
          >
            How to Use
          </h2>
          <ol
            style={{
              fontSize: '13px',
              color: '#555',
              padding: '0 0 0 20px',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            <li>Visit any Instagram profile</li>
            <li>Click the "Quick DM" button</li>
            <li>Send your message instantly!</li>
          </ol>
        </section>

        <section
          style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              margin: '0 0 12px 0',
              color: '#333',
            }}
          >
            Features
          </h2>
          <ul
            style={{
              fontSize: '13px',
              color: '#555',
              padding: '0 0 0 20px',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            <li>Quick DM button on profiles</li>
            <li>Quick message templates</li>
            <li>Works on Chrome, Firefox, Edge</li>
          </ul>
        </section>
      </main>

      <footer
        style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
        }}
      >
        Version 1.0.0
      </footer>
    </div>
  );
}

export default App;
