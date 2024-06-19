const Lyrics = ({
  lyrics,
  ...props
}: {
  lyrics?: string;
  [key: string]: any;
}) => {
  if (!lyrics) {
    return (
      <div className="text-center whitespace-pre px-4" {...props}>
        No lyrics found
      </div>
    );
  }
  return (
    <div className="whitespace-pre px-4" {...props}>
      {lyrics}
    </div>
  );
};
export default Lyrics;
