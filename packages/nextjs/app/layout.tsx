import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Event Ticketing DApp - Built with ChatAndBuild",
  description: "NFT-based event ticketing system with blockchain security and smart contracts",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta property="og:title" content="Event Ticketing DApp - Built with ChatAndBuild" />
        <meta property="og:description" content="NFT-based event ticketing system with blockchain security and smart contracts" />
        <meta property="og:image" content="https://cdn.chatandbuild.com/images/preview.png" />
        <meta property="keywords" content="no-code, app builder, conversation-driven development, blockchain, NFT, event ticketing, smart contracts" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Event Ticketing DApp - Built with ChatAndBuild" />
        <meta property="twitter:description" content="NFT-based event ticketing system with blockchain security and smart contracts" />
        <meta property="twitter:image" content="https://cdn.chatandbuild.com/images/preview.png" />
        <meta property="twitter:site" content="@chatandbuild" />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
