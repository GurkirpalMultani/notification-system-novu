import { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { IJwtPayload } from '@novu/shared';
import { AuthContext } from '../../store/authContext';
import { LoginForm } from '../../components/auth/LoginForm';
import AuthLayout from '../../components/layout/components/AuthLayout';
import AuthContainer from '../../components/layout/components/AuthContainer';
import useVercelIntegration from '../../api/hooks/use-vercel-integration';
import { useMantineTheme, Loader, Paper } from '@mantine/core';
import { colors, Text } from '../../design-system';

export default function LoginPage() {
  const theme = useMantineTheme();
  const { setToken, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryToken = params.get('token');
  const source = params.get('source');
  const code = params.get('code');
  const next = params.get('next');

  const { startVercelSetup, isLoading } = useVercelIntegration();

  useEffect(() => {
    if (queryToken) {
      setToken(queryToken);
    }
  }, [queryToken]);

  useEffect(() => {
    if (token) {
      const user = jwtDecode<IJwtPayload>(token);

      if (!user.organizationId || !user.environmentId) {
        navigate('/auth/application');
      } else {
        if (code && next) {
          startVercelSetup();

          return;
        }

        navigate(source === 'cli' ? '/quickstart' : '/');
      }
    }
  }, [token]);

  return (
    <AuthLayout>
      {isLoading ? (
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Loader color={colors.error} size={32} />
          <Text>Setting up Vercel Integration...</Text>
        </Paper>
      ) : (
        <AuthContainer
          title="Sign In"
          description=" Welcome back! Sign in with the data you entered in your registration"
        >
          <LoginForm />
        </AuthContainer>
      )}
    </AuthLayout>
  );
}
