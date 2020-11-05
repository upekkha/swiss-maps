import * as MUI from "@material-ui/core";
import * as React from "react";
import { Download } from "react-feather";
import { downloadUrl } from "src/shared";
import { useImmer } from "use-immer";
import { useContext } from "../context";

/**
 * The underlying DOM element which is rendered by this component.
 */
const Root = MUI.Paper;

interface Props extends React.ComponentPropsWithoutRef<typeof Root> {}

function Stats(props: Props) {
  const classes = useStyles();

  const { ...rest } = props;

  const ctx = useContext();

  const [state, mutate] = useImmer({
    topojson: {
      size: 0,
    },
    svg: {
      size: 0,
    },
  });

  React.useEffect(() => {
    (async () => {
      const url = downloadUrl({ ...ctx.state.options, format: "topojson" });
      const res = await fetch(url);
      const text = await res.text();
      mutate((draft) => {
        draft.topojson.size = text.length;
      });
    })();

    (async () => {
      const url = downloadUrl({ ...ctx.state.options, format: "svg" });
      const res = await fetch(url);
      const text = await res.text();
      mutate((draft) => {
        draft.svg.size = text.length;
      });
    })();
  }, [ctx.state.options]);

  return (
    <Root elevation={4} className={classes.root} {...rest}>
      <MUI.Typography
        className={classes.stat}
        variant="body2"
        color="textSecondary"
      >
        TopoJSON <span>{humanFileSize(state.topojson.size, false, 0)}</span>
      </MUI.Typography>
      <MUI.Typography
        className={classes.stat}
        variant="body2"
        color="textSecondary"
      >
        SVG <span>{humanFileSize(state.svg.size, false, 0)}</span>
      </MUI.Typography>
    </Root>
  );
}

const useStyles = MUI.makeStyles(
  (theme) => ({
    root: {
      position: "absolute",
      top: 40,
      right: 40,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(1.5, 2),
      width: 160,
    },

    stat: {
      display: "flex",
      justifyContent: "space-between",
    },
  }),
  { name: "XuiGenerator:Stats" }
);

export default Stats;

function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}
