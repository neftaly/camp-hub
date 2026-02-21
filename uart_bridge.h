#include "esphome.h"
#include "driver/usb_serial_jtag.h"
#include "driver/uart.h"

#define BRIDGE_UART UART_NUM_1
#define BRIDGE_TX_PIN 5
#define BRIDGE_RX_PIN 4
#define BRIDGE_BAUD 115200
#define BUF_SIZE 1024

static void uart_bridge_task(void *arg) {
  uint8_t buf[BUF_SIZE];
  while (true) {
    int usb_len = usb_serial_jtag_read_bytes(buf, BUF_SIZE, 1 / portTICK_PERIOD_MS);
    if (usb_len > 0) {
      uart_write_bytes(BRIDGE_UART, buf, usb_len);
    }
    size_t uart_avail = 0;
    uart_get_buffered_data_len(BRIDGE_UART, &uart_avail);
    if (uart_avail > 0) {
      int to_read = uart_avail > BUF_SIZE ? BUF_SIZE : uart_avail;
      int uart_len = uart_read_bytes(BRIDGE_UART, buf, to_read, 1 / portTICK_PERIOD_MS);
      if (uart_len > 0) {
        usb_serial_jtag_write_bytes(buf, uart_len, 10 / portTICK_PERIOD_MS);
      }
    }
  }
}

void start_uart_bridge() {
  uart_config_t uart_config = {
    .baud_rate = BRIDGE_BAUD,
    .data_bits = UART_DATA_8_BITS,
    .parity = UART_PARITY_DISABLE,
    .stop_bits = UART_STOP_BITS_1,
    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
    .source_clk = UART_SCLK_DEFAULT,
  };
  uart_param_config(BRIDGE_UART, &uart_config);
  uart_set_pin(BRIDGE_UART, BRIDGE_TX_PIN, BRIDGE_RX_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
  uart_driver_install(BRIDGE_UART, BUF_SIZE * 2, BUF_SIZE * 2, 0, NULL, 0);

  usb_serial_jtag_driver_config_t usb_config = {
    .tx_buffer_size = BUF_SIZE * 2,
    .rx_buffer_size = BUF_SIZE * 2,
  };
  usb_serial_jtag_driver_install(&usb_config);

  xTaskCreatePinnedToCore(uart_bridge_task, "uart_bridge", 4096, NULL, 10, NULL, 0);
}
