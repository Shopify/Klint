interface Link {
  label: string;
  url: string;
}

interface DocLinksProps {
  githubUrl: string;
  canvasApiUrl?: string;
  additionalLinks?: Link[];
}

const DocLinks = ({
  githubUrl,
  canvasApiUrl,
  additionalLinks = [],
}: DocLinksProps) => {
  return (
    <div className="border-t mt-12 pt-8">
      <h2 className="text-xl font-semibold mb-4">References</h2>
      <ul className="space-y-2">
        <li>
          <a
            href={githubUrl}
            className="text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </li>
        {canvasApiUrl && (
          <li>
            <a
              href={canvasApiUrl}
              className="text-blue-600 hover:text-blue-800 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canvas API Documentation
            </a>
          </li>
        )}
        {additionalLinks.map((link, index) => (
          <li key={index}>
            <a
              href={link.url}
              className="text-blue-600 hover:text-blue-800 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocLinks;
