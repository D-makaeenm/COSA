import socket
import os
import psutil

def get_host_ip():
    addrs = psutil.net_if_addrs()
    for interface, interface_info in addrs.items():
        if "Ethernet" in interface or "Wi-Fi" in interface or "en" in interface or "eth" in interface:
            for addr in interface_info:
                if addr.family == socket.AF_INET:
                    stats = psutil.net_if_stats().get(interface)
                    if stats and stats.isup:
                        return addr.address
    return "127.0.0.1"

# Nếu dùng trong Docker, bạn có thể set qua biến môi trường
host_ip = os.getenv("HOST_IP", get_host_ip())
