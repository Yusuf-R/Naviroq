const { default: E403 } = require("@/components/Errors/E403/E403");

function Forbidden() {
    return (
        <>
            <E403 />
        </>
  );
}

export default Forbidden;