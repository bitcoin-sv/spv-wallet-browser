import { styled } from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logos/horizontal-logo.png';
import { useTheme } from '../hooks/useTheme';
import { GithubIcon, Text } from './Reusable';
import activeCircle from '../assets/active-circle.png';
import { truncate } from '../utils/format';
import gitHubIcon from '../assets/github.svg';
import { useSnackbar } from '../hooks/useSnackbar';
import { useServiceContext } from '../hooks/useServiceContext';
import copyIcon from '../assets/copy.svg';
import notificationIcon from '../assets/notification.svg';
import switchIcon from '../assets/chevrons.svg';
import { WhiteLabelTheme } from '../theme.types';
import { useNavigate } from 'react-router-dom';
import { useBottomMenu } from '../hooks/useBottomMenu';

const Container = styled.div<WhiteLabelTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 11;
`;

const Logo = styled.img`
  width: 6.5rem;
  margin: 1rem;
`;

const Circle = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  border-radius: 50%;
`;

const Dropdown = styled.div<WhiteLabelTheme>`
  position: absolute;
  top: 3.5rem;
  right: 0;
  color: ${({ theme }) => theme.color.global.contrast};
  background: ${({ theme }) => theme.color.global.row + '90'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.color.global.gray};
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 12;
  min-width: 15rem;
  max-height: 18.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.color.global.contrast + '10'};
  }
`;

const CopyIcon = styled.img`
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
`;

const SwitchIcon = styled.img`
  width: 1rem;
  height: 1rem;
  cursor: pointer;
`;

const DropDownIcon = styled.img`
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: 50%;
`;

const DropDownAccountName = styled.p<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
`;

const DropdownAddressText = styled.p<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.gray};
  font-size: 0.75rem;
  margin: 0;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationsDropdown = styled.div<WhiteLabelTheme>`
  position: absolute;
  top: 3.5rem;
  right: 1rem;
  background-color: ${({ theme }) => theme.color.global.walletBackground};
  color: ${({ theme }) => theme.color.global.contrast};
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 12;
  width: 18rem;
  padding: 1rem;

  h4 {
    margin: 0;
    font-size: 1rem;
    color: ${({ theme }) => theme.color.global.contrast};
  }

  ul {
    margin: 1rem 0;
    padding: 0;
    list-style-type: none;
    max-height: 200px;
    overflow-y: auto;
  }

  li {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: ${({ theme }) => theme.color.global.gray + '20'};
    border-radius: 0.25rem;
  }

  button {
    background-color: ${({ theme }) => theme.color.global.gray};
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    width: 100%;
    font-size: 0.85rem;

    &:hover {
      background-color: ${({ theme }) => theme.color.global.neutral};
    }
  }
`;

const NotificationBubble = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
`;

export const TopNav = () => {
  const { theme } = useTheme();
  const { chromeStorageService } = useServiceContext();
  const { handleSelect } = useBottomMenu();
  const navigate = useNavigate();
  const { addSnackbar } = useSnackbar();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLDivElement | null>(null);
  const accountObj = chromeStorageService.getCurrentAccountObject();
  const [notifications, setNotifications] = useState<string[]>([]); // Store notifications
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [unreadCount, setUnreadCount] = useState(0); // Track number of unread notifications

  // Fetch notifications from chrome storage
  useEffect(() => {
    chrome.storage.local.get(['notifications'], (result) => {
      if (result.notifications) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.length);
      }
    });
  }, []);

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    chrome.storage.local.set({ notifications: [] }); // Clear from chrome storage
  };

  const handleCopyToClipboard = (bsvAddress: string) => {
    navigator.clipboard.writeText(bsvAddress).then(() => {
      addSnackbar('Copied!', 'success');
    });
  };

  const handleSwitchAccount = async (identityAddress: string) => {
    await chromeStorageService.switchAccount(identityAddress);
    setDropdownVisible(false);
    navigate('/bsv-wallet?reload=true');
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      toggleRef.current &&
      !toggleRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);

  return (
    <Container theme={theme}>
      <LogoWrapper>
        <Logo src={logo} />
        <Text style={{ margin: '0', marginLeft: '-0.25rem' }} theme={theme}>
          /
        </Text>
        <Circle src={accountObj.account?.icon ?? activeCircle} />
        <FlexContainer style={{ justifyContent: 'flex-start', minWidth: 'fit-content' }} ref={toggleRef}>
          <Text
            style={{
              margin: '0 0.25rem 0 0.25rem',
              textAlign: 'left',
              color: theme.color.global.contrast,
              fontSize: '0.75rem',
              cursor: 'pointer',
              minWidth: 'fit-content',
            }}
            theme={theme}
            onClick={toggleDropdown}
          >
            {accountObj.account?.name ?? accountObj.account?.addresses.identityAddress}
          </Text>
          <SwitchIcon src={switchIcon} onClick={toggleDropdown} />
        </FlexContainer>
      </LogoWrapper>

      <FlexContainer>
        <GithubIcon style={{ marginLeft: '1.2rem' }} src={notificationIcon} onClick={toggleDropdown} />
        {unreadCount > 0 && <NotificationBubble>{unreadCount}</NotificationBubble>}
      </FlexContainer>

      {showDropdown && (
        <NotificationsDropdown theme={theme}>
          <h4>Notifications</h4>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => <li key={index}>{notification}</li>)
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
          {notifications.length > 0 && <button onClick={clearNotifications}>Clear All</button>}
        </NotificationsDropdown>
      )}

      <GithubIcon
        style={{ marginRight: '1.5rem' }}
        src={gitHubIcon}
        onClick={() => window.open(theme.settings.repo, '_blank')}
      />
    </Container>
  );
};
