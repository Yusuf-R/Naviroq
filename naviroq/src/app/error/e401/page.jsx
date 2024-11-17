const { default: E401 } = require("@/components/Errors/E401/E401");

function UnAuthorization() {
    return (
        <>
            <E401 />
        </>
  );
}