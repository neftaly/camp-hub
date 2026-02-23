import { Tui, Box, Text } from "../lib/tui";

export function ConnectDialog({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="dialog-overlay">
      <Tui cols={28} className="dialog">
        <Box border borderColor="border-bright">
          <Text value="" centered />
          <Text value="Awaiting Bluetooth" centered />
          <Text value="" centered />
          <Text
            value=" Connect "
            valueColor="thumb"
            centered
            onClick={onConnect}
            cursor="pointer"
          />
          <Text value="" centered />
        </Box>
      </Tui>
    </div>
  );
}
