export default function Home() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Primary Font Test */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">Coldop Web App</h1>
          <p className="text-lg">
            This text uses the primary font (Lusitana). Change the fontConfig to see different fonts
            applied globally.
          </p>
        </section>

        {/* Secondary Font Test */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold font-secondary">Testing Secondary Font</h2>
          <p className="font-secondary">
            This section uses the secondary font (Montserrat) with the font-secondary class. You can
            apply this class to any element.
          </p>
        </section>

        {/* Mono Font Test */}
        <section className="space-y-4">
          <h3 className="text-2xl font-medium">Code Example</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="font-mono text-sm">
              {`export const fontConfig = {
  primary: 'lusitana',
  secondary: 'montserrat',
  mono: 'geistMono',
};`}
            </code>
          </pre>
        </section>

        {/* Font Comparison */}
        <section className="space-y-4">
          <h3 className="text-2xl font-medium">Font Comparison</h3>
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <p className="font-bold mb-2">Primary (Default Body):</p>
              <p>The quick brown fox jumps over the lazy dog. 0123456789</p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-bold mb-2">Secondary:</p>
              <p className="font-secondary">
                The quick brown fox jumps over the lazy dog. 0123456789
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="font-bold mb-2">Mono:</p>
              <p className="font-mono">The quick brown fox jumps over the lazy dog. 0123456789</p>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">How to Change Fonts</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Open{' '}
              <code className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                fontConfig.ts
              </code>
            </li>
            <li>Change the font values in the config object</li>
            <li>
              Available options: &apos;inter&apos;, &apos;lusitana&apos;, &apos;montserrat&apos;,
              &apos;notoSans&apos;, &apos;geistSans&apos;, &apos;geistMono&apos;
            </li>
            <li>Save the file and the fonts will update globally!</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
