export function Header() {
  return (
    <>
      <div className="bg-[#eabb80] text-sm p-2 text-center">
        It's a proof of concept, transaction stream might not be working because
        it requires a running substream sql-sink
      </div>
      <header className="bg-secondary pl-20 pr-20 p-4 text-secondary-foreground">
        <h1 className="text-xl font-bold">MEVision</h1>
      </header>
    </>
  );
}
